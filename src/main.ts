/* eslint-env node */
import path from 'path';
import * as core from '@actions/core';
import {exec} from '@actions/exec';
import * as glob from '@actions/glob';
import * as github from '@actions/github';
import * as io from '@actions/io';
import {Storage} from '@google-cloud/storage';
import * as Sentry from '@sentry/node';
import {RewriteFrames} from '@sentry/integrations';

import {createDiff} from './util/createDiff';
import {downloadArtifact} from './api/downloadArtifact';

const {owner, repo} = github.context.repo;
const token = core.getInput('githubToken');
const octokit = github.getOctokit(token);
const GITHUB_WORKFLOW = process.env.GITHUB_WORKFLOW as string;
const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE as string;
const GITHUB_EVENT_PATH = process.env.GITHUB_EVENT_PATH as string;
const GOOGLE_CREDENTIALS = core.getInput('gcp-service-account-key');

Sentry.init({
  dsn: 'https://34b97f5891a044c6ab1f6ce6332733fb@o1.ingest.sentry.io/5246761',
  integrations: [new RewriteFrames({root: __dirname || process.cwd()})],
});
console.log(JSON.stringify(process.env, null, 2));

const GITHUB_EVENT = require(GITHUB_EVENT_PATH);

const credentials =
  GOOGLE_CREDENTIALS &&
  JSON.parse(Buffer.from(GOOGLE_CREDENTIALS, 'base64').toString('utf8'));

// Creates a client
const storage = credentials && new Storage({credentials});

async function run(): Promise<void> {
  try {
    const current: string = core.getInput('snapshot-path');
    const diff: string = core.getInput('diff-path');
    const diffPath = path.resolve(GITHUB_WORKSPACE, diff);
    const basePath = path.resolve('/tmp/visual-snapshots-base');
    const baseBranch = core.getInput('base-branch');
    const baseArtifactName = core.getInput('base-artifact-name');

    core.debug(`${current} vs ${diff}`);
    core.debug(GITHUB_WORKSPACE);

    // Forward `diff-path` to outputs
    core.setOutput('diff-path', diff);

    const newSnapshots = new Set<string>([]);
    const changedSnapshots = new Set<string>([]);
    const missingSnapshots = new Set<string>([]);
    const currentSnapshots = new Set<string>([]);
    const baseSnapshots = new Set<string>([]);

    const didDownload = await downloadArtifact(octokit, {
      owner,
      repo,
      branch: baseBranch,
      workflow_id: `${GITHUB_WORKFLOW}.yml`,
      artifactName: baseArtifactName,
      downloadPath: basePath,
    });

    if (!didDownload) {
      core.debug('Unable to download artifact from base branch');
      return;
    }

    // globs
    const pngGlob = '/**/*.png';
    const [baseGlobber, currentGlobber] = await Promise.all([
      glob.create(`${basePath}${pngGlob}`, {followSymbolicLinks: false}),
      glob.create(`${current}${pngGlob}`, {followSymbolicLinks: false}),
    ]);

    const [baseFiles, currentFiles] = await Promise.all([
      baseGlobber.glob(),
      currentGlobber.glob(),
    ]);

    if (!baseFiles.length) {
      core.debug('No snapshots found for base branch');
    }

    if (!currentFiles.length) {
      core.debug('No snapshots found for current branch');
    }

    // make diff dir if not exists
    await io.mkdirP(diffPath);

    baseFiles.forEach(absoluteFile => {
      const file = path.relative(basePath, absoluteFile);
      baseSnapshots.add(file);
      missingSnapshots.add(file);
    });

    const getChildPaths = (base: string, fullPathToFile: string) =>
      path.relative(
        base,
        fullPathToFile.replace(path.basename(fullPathToFile), '')
      );

    // Since we recurse in the directories looking for pngs, we need to replicate
    // directory structure in the diff directory
    const childPaths = new Set([
      ...currentFiles.map(getChildPaths.bind(null, current)),
      ...baseFiles.map(getChildPaths.bind(null, basePath)),
    ]);

    try {
      await Promise.all(
        [...childPaths].map(async childPath =>
          io.mkdirP(path.resolve(GITHUB_WORKSPACE, diff, childPath))
        )
      );
    } catch {
      // ignore mkdir errors
    }

    // Diff snapshots against base branch
    await Promise.all(
      currentFiles.map(async absoluteFile => {
        const file = path.relative(current, absoluteFile);
        currentSnapshots.add(file);

        if (baseSnapshots.has(file)) {
          try {
            const isDiff = await createDiff(
              file,
              path.resolve(GITHUB_WORKSPACE, diff),
              path.resolve(GITHUB_WORKSPACE, current, file),
              path.resolve(basePath, file)
            );
            if (isDiff) {
              changedSnapshots.add(file);
            }
            missingSnapshots.delete(file);
          } catch (err) {
            core.debug(`Unable to diff: ${err.message}`);
            Sentry.captureException(err);
          }
        } else {
          newSnapshots.add(file);
        }
      })
    );

    missingSnapshots.forEach(file => {
      core.debug(`missing snapshot: ${file}`);
    });

    newSnapshots.forEach(fileName => {
      core.debug(`new snapshot: ${fileName}`);
    });

    changedSnapshots.forEach(name => {
      core.debug(`changed snapshot: ${name}`);
    });

    // TODO: Upload diff files where and update check with them
    const diffGlobber = await glob.create(`${diffPath}${pngGlob}`, {
      followSymbolicLinks: false,
    });
    const diffFiles = await diffGlobber.glob();

    const gcsBucket = core.getInput('gcs-bucket');
    const diffArtifactUrls =
      gcsBucket && storage
        ? await Promise.all(
            diffFiles.map(async file => {
              const relativeFilePath = path.relative(diffPath, file);
              const [File] = await storage.bucket(gcsBucket).upload(file, {
                // Support for HTTP requests made with `Accept-Encoding: gzip`
                destination: `${owner}/${repo}/${GITHUB_EVENT.pull_request.head.sha}/diff/${relativeFilePath}`,
                gzip: true,
                // By setting the option `destination`, you can change the name of the
                // object you are uploading to a bucket.
                metadata: {
                  // Enable long-lived HTTP caching headers
                  // Use only if the contents of the file will never change
                  // (If the contents will change, use cacheControl: 'no-cache')
                  cacheControl: 'public, max-age=31536000',
                },
              });

              return {
                alt: relativeFilePath,
                image_url: `https://storage.googleapis.com/${gcsBucket}/${File.name}`,
              };
            })
          )
        : [];

    // Create results artifact dir
    const resultsPath = '/tmp/visual-snapshop-results';
    await io.mkdirP(resultsPath);
    await io.cp(diffPath, resultsPath, {recursive: true});
    await exec(`ls ${resultsPath}`);
    // await Promise.all(diffFiles.map(async file => {
    // // for each diffFile, we need to copy the base and current files
    // const relativeFilePath = getChildPaths(diffPath, file);
    // return [
    // io.cp(path.resolve(basePath, relativeFilePath), path.resolve(
    // }))

    const conclusion =
      !!changedSnapshots.size || !!missingSnapshots.size
        ? 'failure'
        : !!newSnapshots.size
        ? 'neutral'
        : 'success';

    const unchanged =
      baseFiles.length - (changedSnapshots.size + missingSnapshots.size);

    // Create a GitHub check with our results
    await octokit.checks.create({
      owner,
      repo,
      name: 'Visual Snapshot',
      head_sha: GITHUB_EVENT.pull_request.head.sha,
      status: 'completed',
      conclusion,
      output: {
        title: 'Visual Snapshots',
        summary: `Summary:
* **${changedSnapshots.size}** changed snapshots (${unchanged} unchanged)
* **${missingSnapshots.size}** missing snapshots
* **${newSnapshots.size}** new snapshots
`,
        text: `
## Changed snapshots
${[...changedSnapshots].map(name => `* ${name}`).join('\n')}

## Missing snapshots
${[...missingSnapshots].map(name => `* ${name}`).join('\n')}

## New snapshots
${[...newSnapshots].map(name => `* ${name}`).join('\n')}
`,
        images: diffArtifactUrls,
      },
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
