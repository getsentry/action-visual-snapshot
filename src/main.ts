/* eslint-env node */
import path from 'path';
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as github from '@actions/github';
import * as io from '@actions/io';
import * as Sentry from '@sentry/node';
import {RewriteFrames} from '@sentry/integrations';

import {createDiff} from './util/createDiff';
import {downloadOtherWorkflowArtifact} from './api/downloadOtherWorkflowArtifact';
import {multiCompare} from './util/multiCompare';
import {generateImageGallery} from './util/generateImageGallery';
import {saveSnapshots} from './util/saveSnapshots';
import {downloadSnapshots} from './util/downloadSnapshots';
import {uploadToGcs} from './util/uploadToGcs';
import {getStorageClient} from './util/getStorageClient';

const {owner, repo} = github.context.repo;
const token = core.getInput('githubToken');
const octokit = token && github.getOctokit(token);
const {GITHUB_EVENT_PATH, GITHUB_WORKSPACE, GITHUB_WORKFLOW} = process.env;
const pngGlob = '/**/*.png';

Sentry.init({
  dsn: 'https://34b97f5891a044c6ab1f6ce6332733fb@o1.ingest.sentry.io/5246761',
  integrations: [new RewriteFrames({root: __dirname || process.cwd()})],
});
// console.log(JSON.stringify(process.env, null, 2));
// console.log(JSON.stringify(github, null, 2));

const GITHUB_EVENT = require(GITHUB_EVENT_PATH);

/**
 * Given a base path and a full path to file, we want to find
 * the subdirectories "between" `base` and `fullPathToFile`
 */
const getChildPaths = (base: string, fullPathToFile: string) =>
  path.relative(
    base,
    fullPathToFile.replace(path.basename(fullPathToFile), '')
  );

async function run(): Promise<void> {
  try {
    const resultsRootPath: string = core.getInput('results-path');
    const baseBranch = core.getInput('base-branch');
    const artifactName = core.getInput('artifact-name');
    const gcsBucket = core.getInput('gcs-bucket');
    const shouldSaveOnly = core.getInput('save-only');

    const resultsPath = path.resolve(
      resultsRootPath,
      'visual-snapshots-results'
    );
    const diffPath = path.resolve(resultsPath, 'diffs');
    const basePath = path.resolve('/tmp/visual-snapshots-base');
    const mergeBasePath = path.resolve('/tmp/visual-snapshop-merge-base');

    core.debug(`resultsPath: ${resultsPath}`);
    core.debug(GITHUB_WORKSPACE);

    // Forward `results-path` to outputs
    core.setOutput('results-path', resultsRootPath);
    core.setOutput('base-images-path', basePath);
    core.setOutput('merge-base-images-path', mergeBasePath);

    // Only needs to upload snapshots
    if (shouldSaveOnly !== 'false') {
      const current: string = core.getInput('snapshot-path');
      await saveSnapshots({
        artifactName,
        rootDirectory: current,
      });

      return;
    }

    if (!octokit) {
      throw new Error('`githubToken` missing');
    }

    const newSnapshots = new Set<string>([]);
    const changedSnapshots = new Set<string>([]);
    const missingSnapshots = new Set<string>([]);
    const currentSnapshots = new Set<string>([]);
    const baseSnapshots = new Set<string>([]);

    const mergeBaseSha: string = github.context.payload.pull_request?.base?.sha;
    const [didDownloadLatest] = await Promise.all([
      downloadOtherWorkflowArtifact(octokit, {
        owner,
        repo,
        branch: baseBranch,
        workflow_id: `${GITHUB_WORKFLOW}.yml`,
        artifactName,
        downloadPath: basePath,
      }),
      downloadOtherWorkflowArtifact(octokit, {
        owner,
        repo,
        branch: baseBranch,
        workflow_id: `${GITHUB_WORKFLOW}.yml`,
        artifactName,
        downloadPath: mergeBasePath,
        commit: mergeBaseSha,
      }),
    ]);

    if (!didDownloadLatest) {
      core.warning('Unable to download artifact from base branch');
      return;
    }

    // Download snapshots from current branch
    const resp = await downloadSnapshots({
      artifactName,
      rootDirectory: '/tmp/visual-snapshots',
    });
    const current = resp.downloadPath;

    // globs
    const [baseGlobber, currentGlobber, mergeBaseGlobber] = await Promise.all([
      glob.create(`${basePath}${pngGlob}`, {followSymbolicLinks: false}),
      glob.create(`${current}${pngGlob}`, {followSymbolicLinks: false}),
      glob.create(`${mergeBasePath}${pngGlob}`, {followSymbolicLinks: false}),
    ]);

    const [baseFiles, currentFiles, mergeBaseFiles] = await Promise.all([
      baseGlobber.glob(),
      currentGlobber.glob(),
      mergeBaseGlobber.glob(),
    ]);

    if (!baseFiles.length) {
      core.warning('No snapshots found for base branch');
    }

    if (!currentFiles.length) {
      core.warning('No snapshots found for current branch');
    }

    // make diff dir if not exists
    await io.mkdirP(diffPath);

    baseFiles.forEach(absoluteFile => {
      const file = path.relative(basePath, absoluteFile);
      baseSnapshots.add(file);
      missingSnapshots.add(file);
    });

    // index merge base files as well
    const mergeBaseSnapshots = new Set(
      mergeBaseFiles.map(absolute => path.relative(mergeBasePath, absolute))
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
          io.mkdirP(path.resolve(diffPath, childPath))
        )
      );
    } catch {
      // ignore mkdir errors
    }

    // Diff snapshots against base branch
    // This is to make sure we run the above tasks serially, otherwise we will
    // face OOM issues
    for (const absoluteFile of currentFiles) {
      const file = path.relative(current, absoluteFile);
      currentSnapshots.add(file);

      if (baseSnapshots.has(file)) {
        try {
          let isDiff;

          // If merge base snapshot exists, do a 3way diff
          if (mergeBaseSnapshots.has(file)) {
            isDiff = await multiCompare({
              branchBase: path.resolve(mergeBasePath, file),
              baseHead: path.resolve(basePath, file),
              branchHead: path.resolve(GITHUB_WORKSPACE, current, file),
              output: diffPath,
              snapshotName: file,
            });
          } else {
            isDiff = await createDiff(
              file,
              diffPath,
              path.resolve(basePath, file),
              path.resolve(GITHUB_WORKSPACE, current, file)
            );
          }

          if (isDiff) {
            changedSnapshots.add(file);
          }
          core.debug(`diffed: ${file}: ${isDiff}`);
          missingSnapshots.delete(file);
        } catch (err) {
          core.debug(`Unable to diff: ${err.message}`);
          Sentry.captureException(err);
        }
      } else {
        newSnapshots.add(file);
      }
    }

    missingSnapshots.forEach(file => {
      if (!mergeBaseSnapshots.has(file)) {
        missingSnapshots.delete(file);
        return;
      }
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

    const gcsDestination = `${owner}/${repo}/${GITHUB_EVENT.pull_request.head.sha}`;
    const diffArtifactUrls = await uploadToGcs({
      files: diffFiles,
      root: diffPath,
      bucket: gcsBucket,
      destinationRoot: `${gcsDestination}/diffs`,
    });
    const changedArray = [...changedSnapshots];

    await generateImageGallery(path.resolve(resultsPath, 'index.html'), {
      changed: Object.fromEntries(
        changedArray.map(file => [path.basename(file, '.png'), file])
      ),
    });

    const storage = getStorageClient();
    const [imageGalleryFile] = storage
      ? await storage
          .bucket(gcsBucket)
          .upload(path.resolve(resultsPath, 'index.html'), {
            destination: `${gcsDestination}/index.html`,
            gzip: true,
            metadata: {
              cacheControl: 'public, max-age=31536000',
            },
          })
      : [];

    const conclusion =
      !!changedSnapshots.size || !!missingSnapshots.size
        ? 'failure'
        : !!newSnapshots.size
        ? 'neutral'
        : 'success';

    const unchanged =
      baseFiles.length - (changedSnapshots.size + missingSnapshots.size);

    await Promise.all([
      saveSnapshots({
        artifactName: `${artifactName}-results`,
        rootDirectory: resultsRootPath,
      }),

      // Create a GitHub check with our results
      octokit.checks.create({
        owner,
        repo,
        name: 'Visual Snapshot',
        head_sha: GITHUB_EVENT.pull_request.head.sha,
        status: 'completed',
        conclusion,
        output: {
          title: 'Visual Snapshots',
          summary: `

${
  imageGalleryFile
    ? `[View Image Gallery](https://storage.googleapis.com/${gcsBucket}/${imageGalleryFile.name})`
    : ''
}

* **${changedSnapshots.size}** changed snapshots (${unchanged} unchanged)
* **${missingSnapshots.size}** missing snapshots
* **${newSnapshots.size}** new snapshots
`,
          text: `
${
  changedSnapshots.size
    ? `## Changed snapshots
${[...changedSnapshots].map(name => `* ${name}`).join('\n')}
`
    : ''
}

${
  missingSnapshots.size
    ? `## Missing snapshots
${[...missingSnapshots].map(name => `* ${name}`).join('\n')}
`
    : ''
}

${
  newSnapshots.size
    ? `## New snapshots
${[...newSnapshots].map(name => `* ${name}`).join('\n')}
`
    : ''
}
`,
          images: diffArtifactUrls,
        },
      }),
    ]);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
