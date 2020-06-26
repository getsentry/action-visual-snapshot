/* eslint-env node */
import * as fsNs from 'fs';
import path from 'path';
import * as github from '@actions/github';
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import {exec} from '@actions/exec';
import {Storage} from '@google-cloud/storage';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';

const fs = fsNs.promises;
const {owner, repo} = github.context.repo;
const token = core.getInput('githubToken');
const octokit = github.getOctokit(token);
const GITHUB_SHA = process.env.GITHUB_SHA || '';
const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE || '';
const GOOGLE_CREDENTIALS = core.getInput('gcp-service-account-key');

const credentials =
  GOOGLE_CREDENTIALS &&
  JSON.parse(Buffer.from(GOOGLE_CREDENTIALS, 'base64').toString('utf8'));

// Creates a client
const storage = credentials && new Storage({credentials});

async function createDiff(
  snapshotName: string,
  output: string,
  file1: string,
  file2: string
) {
  const [fileContent1, fileContent2] = await Promise.all([
    fs.readFile(file1),
    fs.readFile(file2),
  ]);

  const img1 = PNG.sync.read(fileContent1);
  const img2 = PNG.sync.read(fileContent2);
  const {width, height} = img1;
  const diff = new PNG({width, height});

  const result = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1,
  });

  if (result > 0) {
    await fs.writeFile(
      path.resolve(output, snapshotName),
      PNG.sync.write(diff)
    );
  }

  return result;
}

async function run(): Promise<void> {
  try {
    const current: string = core.getInput('snapshot-path');
    const diff: string = core.getInput('diff-path');
    const diffPath = path.resolve(GITHUB_WORKSPACE, diff);

    core.debug(`${current} vs ${diff}`);

    core.debug(GITHUB_WORKSPACE);
    core.setOutput('diff-path', diff);

    const newSnapshots = new Set<string>([]);
    const changedSnapshots = new Set<string>([]);
    const missingSnapshots = new Set<string>([]);
    const currentSnapshots = new Set<string>([]);
    const baseSnapshots = new Set<string>([]);

    // fetch artifact from main branch
    // this is hacky since github actions do not support downloading
    // artifacts from different workflows
    const {
      data: {
        workflow_runs: [workflowRun],
      },
    } = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      // Below is typed incorrectly
      // @ts-ignore
      workflow_id: core.getInput('base-workflow-id'),
      branch: core.getInput('base-branch'),
    });

    if (!workflowRun) {
      core.debug('No base workflow run found');
      return;
    }

    const {
      data: {artifacts},
    } = await octokit.actions.listWorkflowRunArtifacts({
      owner,
      repo,
      run_id: workflowRun.id,
    });

    core.debug(JSON.stringify(artifacts));
    // filter artifacts for `visual-snapshots-main`
    const mainSnapshotArtifact = artifacts.find(
      artifact => artifact.name === core.getInput('base-artifact-name')
    );

    if (!mainSnapshotArtifact) {
      core.debug('Artifact not found');
      return;
    }

    // Download the artifact
    const download = await octokit.actions.downloadArtifact({
      owner,
      repo,
      artifact_id: mainSnapshotArtifact.id,
      archive_format: 'zip',
    });

    core.debug(JSON.stringify(download));

    const outputPath = path.resolve('/tmp/visual-snapshots-base');
    try {
      await fs.mkdir(outputPath, {recursive: true});
    } catch {
      core.debug(`Unable to create dir: ${outputPath}`);
    }

    await exec(
      `curl -L -o ${path.resolve(outputPath, 'visual-snapshots-base.zip')} ${
        download.url
      }`
    );
    await exec(
      `unzip -d ${outputPath} ${path.resolve(
        outputPath,
        'visual-snapshots-base.zip'
      )}`
    );

    // globs
    const pngGlob = '/**/*.png';
    const [baseGlobber, currentGlobber] = await Promise.all([
      glob.create(`${outputPath}${pngGlob}`, {followSymbolicLinks: false}),
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

    // make output dir if not exists
    try {
      await fs.mkdir(diffPath, {recursive: true});
    } catch {
      core.debug(`Unable to create dir: ${diffPath}`);
    }

    baseFiles.forEach(absoluteFile => {
      const file = path.relative(outputPath, absoluteFile);
      baseSnapshots.add(file);
      missingSnapshots.add(file);
    });

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
              path.resolve(outputPath, file)
            );
            if (isDiff) {
              changedSnapshots.add(file);
            }
            missingSnapshots.delete(file);
          } catch (err) {
            core.debug(`Unable to diff: ${err.message}`);
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

    core.debug(diffFiles.join(', '));

    const gcsBucket = core.getInput('gcs-bucket');
    const diffArtifactUrls =
      gcsBucket && storage
        ? await Promise.all(
            diffFiles.map(async file => {
              const [File] = await storage.bucket(gcsBucket).upload(file, {
                // Support for HTTP requests made with `Accept-Encoding: gzip`
                destination: `${owner}/${repo}/${GITHUB_SHA}/diff/${file}`,
                // public: true,
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
              console.log(file, File);

              return {
                alt: file,
                image_url: `https://storage.googleapis.com/${gcsBucket}/${File.name}`,
              };
            })
          )
        : [];

    const conclusion =
      !!changedSnapshots.size || !!missingSnapshots.size
        ? 'failure'
        : !!newSnapshots.size
        ? 'neutral'
        : 'success';

    core.debug(`conclusion: ${conclusion}`);

    // Create a GitHub check with our results
    const resp = await octokit.checks.create({
      owner,
      repo,
      name: 'Visual Snapshot',
      head_sha: GITHUB_SHA,
      status: 'completed',
      conclusion,
      output: {
        title: 'Visual Snapshots',
        summary: `Summary:
* **${changedSnapshots.size}** changed snapshots
* **${missingSnapshots.size}** missing snapshots
* **${newSnapshots.size}** new snapshots
`,
        text: `
## Changed snapshots
${[...changedSnapshots].map(name => `* ${name}`).join('\n')}

## Missing snapshots
${[...missingSnapshots].map(([name]) => `* ${name}`).join('\n')}

## New snapshots
${[...newSnapshots].map(name => `* ${name}`).join('\n')}
`,
        images: diffArtifactUrls,
      },
    });
    console.log(resp);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
