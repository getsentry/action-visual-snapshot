/* eslint-env node */
import path from 'path';
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as github from '@actions/github';
import * as Sentry from '@sentry/node';
import {RewriteFrames} from '@sentry/integrations';

import {generateImageGallery} from './util/generateImageGallery';
import {saveSnapshots} from './util/saveSnapshots';
import {downloadSnapshots} from './util/downloadSnapshots';
import {uploadToGcs} from './util/uploadToGcs';
import {getStorageClient} from './util/getStorageClient';
import {diffSnapshots} from './util/diffSnapshots';
import {retrieveBaseSnapshots} from './api/retrieveBaseSnapshots';
import {startBuild} from './api/startBuild';
import {finishBuild} from './api/finishBuild';
import {failBuild} from './api/failBuild';
import {SENTRY_DSN} from './config';

const {owner, repo} = github.context.repo;
const token = core.getInput('github-token') || core.getInput('githubToken');
const octokit = token && github.getOctokit(token);
const {GITHUB_EVENT_PATH, GITHUB_WORKSPACE, GITHUB_WORKFLOW} = process.env;
const pngGlob = '/**/*.png';

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new RewriteFrames({root: __dirname || process.cwd()})],
  release: process.env.VERSION,
});
// console.log(JSON.stringify(process.env, null, 2));
// console.log(JSON.stringify(github, null, 2));

const GITHUB_EVENT = require(GITHUB_EVENT_PATH);

function handleError(error: Error) {
  Sentry.captureException(error);
  core.setFailed(error.message);
}

async function run(): Promise<void> {
  const resultsRootPath: string = core.getInput('results-path');
  const baseBranch = core.getInput('base-branch');
  const artifactName = core.getInput('artifact-name');
  const gcsBucket = core.getInput('gcs-bucket');
  const shouldSaveOnly = core.getInput('save-only');
  const apiToken = core.getInput('api-token');
  const actionName = core.getInput('action-name');

  const resultsPath = path.resolve(resultsRootPath, 'visual-snapshots-results');
  const basePath = path.resolve('/tmp/visual-snapshots-base');
  const mergeBasePath = path.resolve('/tmp/visual-snapshop-merge-base');

  core.debug(`resultsPath: ${resultsPath}`);
  core.debug(GITHUB_WORKSPACE);

  // Forward `results-path` to outputs
  core.setOutput('results-path', resultsRootPath);
  core.setOutput('base-images-path', basePath);
  core.setOutput('merge-base-images-path', mergeBasePath);

  try {
    // Only needs to upload snapshots
    if (shouldSaveOnly !== 'false') {
      const current: string = core.getInput('snapshot-path');
      await saveSnapshots({
        artifactName,
        rootDirectory: current,
      });

      return;
    }
  } catch (error) {
    handleError(error);
  }

  if (!octokit) {
    handleError(new Error('`github-token` missing'));
    return;
  }

  core.debug('Starting build...');
  const buildId = await startBuild({
    octokit,
    owner,
    repo,
    token: apiToken,
    head_sha: GITHUB_EVENT.pull_request.head.sha,
    name: actionName,
  });

  try {
    const mergeBaseSha: string = github.context.payload.pull_request?.base?.sha;

    core.debug(`Merge base SHA is: ${mergeBaseSha}`);

    const [
      didDownloadLatest,
      didDownloadMergeBase,
    ] = await retrieveBaseSnapshots(octokit, {
      owner,
      repo,
      branch: baseBranch,
      workflow_id: `${GITHUB_WORKFLOW}.yml`,
      artifactName,
      basePath,
      mergeBasePath,
      mergeBaseSha,
    });

    if (!didDownloadLatest) {
      // It's possible there are no base snapshots e.g. if these are all
      // new snapshots.
      core.warning('Unable to download artifact from base branch');
    }

    if (!didDownloadMergeBase) {
      // We can still diff against base
      core.debug('Unable to download artifact from merge base sha');
    }

    core.debug('Downloading current snapshots');

    // Download snapshots from current branch
    const resp = await downloadSnapshots({
      artifactName,
      rootDirectory: '/tmp/visual-snapshots',
    });
    const current = resp.downloadPath;
    const currentPath = path.resolve(GITHUB_WORKSPACE, current);

    core.debug('Diffing snapshots...');
    const {
      baseFiles,
      changedSnapshots,
      missingSnapshots,
      newSnapshots,
    } = await diffSnapshots({
      basePath,
      mergeBasePath,
      currentPath,
      outputPath: resultsPath,
    });

    const resultsGlobber = await glob.create(`${resultsPath}${pngGlob}`, {
      followSymbolicLinks: false,
    });
    const resultsFiles = await resultsGlobber.glob();

    const gcsDestination = `${owner}/${repo}/${GITHUB_EVENT.pull_request.head.sha}`;
    const resultsArtifactUrls = await uploadToGcs({
      files: resultsFiles,
      root: resultsPath,
      bucket: gcsBucket,
      destinationRoot: `${gcsDestination}/results`,
    });
    const changedArray = [...changedSnapshots];
    const results = {
      baseFilesLength: baseFiles.length,
      changed: changedArray,
      missing: [...missingSnapshots],
      added: [...newSnapshots],
    };

    core.debug('Generating image gallery...');
    await generateImageGallery(
      path.resolve(resultsPath, 'index.html'),
      results
    );

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

    const galleryUrl =
      imageGalleryFile &&
      `https://storage.googleapis.com/${gcsBucket}/${imageGalleryFile.name}`;

    core.debug('Saving snapshots and finishing build...');
    await Promise.all([
      saveSnapshots({
        artifactName: `${artifactName}-results`,
        rootDirectory: resultsRootPath,
      }),

      finishBuild({
        octokit,
        id: buildId,
        owner,
        repo,
        token: apiToken,
        galleryUrl,
        images: resultsArtifactUrls,
        results,
      }),
    ]);
  } catch (error) {
    handleError(error);
    failBuild({
      octokit,
      id: buildId,
      owner,
      repo,
      token: apiToken,
    });
  }
}

run();
