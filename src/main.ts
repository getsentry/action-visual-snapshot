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

const originalCoreDebug = core.debug;

// @ts-ignore
core.debug = (message: string) => {
  Sentry.addBreadcrumb({
    category: 'console',
    message,
    level: Sentry.Severity.Debug,
  });
  originalCoreDebug(message);
};

// console.log(JSON.stringify(process.env, null, 2));

const GITHUB_EVENT = require(GITHUB_EVENT_PATH);

function handleError(error: Error) {
  Sentry.captureException(error);
  core.setFailed(error.message);
}

// console.log(JSON.stringify(GITHUB_EVENT, null, 2));

async function run(): Promise<void> {
  const resultsRootPath: string = core.getInput('results-path');
  const baseBranch = core.getInput('base-branch');
  const artifactName = core.getInput('artifact-name');
  const gcsBucket = core.getInput('gcs-bucket');
  const shouldSaveOnly = core.getInput('save-only');
  const apiToken = core.getInput('api-token');
  const actionName = core.getInput('action-name');
  const snapshotPath: string = core.getInput('snapshot-path');

  const resultsPath = path.resolve(resultsRootPath, 'visual-snapshots-results');
  const basePath = path.resolve('/tmp/visual-snapshots-base');
  const mergeBasePath = path.resolve('/tmp/visual-snapshop-merge-base');

  const headSha = GITHUB_EVENT.pull_request.head.sha;
  const headRef = GITHUB_EVENT.pull_request.head.ref;

  core.debug(`resultsPath: ${resultsPath}`);
  core.debug(GITHUB_WORKSPACE);

  // Forward `results-path` to outputs
  core.setOutput('results-path', resultsRootPath);
  core.setOutput('base-images-path', basePath);
  core.setOutput('merge-base-images-path', mergeBasePath);

  try {
    if (snapshotPath) {
      await saveSnapshots({
        artifactName,
        rootDirectory: snapshotPath,
      });
    }

    // Only needs to upload snapshots, do not proceed further
    if (shouldSaveOnly !== 'false') {
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
    headSha,
    headRef,
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

    let downloadResp: Await<ReturnType<typeof downloadSnapshots>> | null = null;

    // TODO maybe make this more explicit, but if snapshot path is not defined
    // we assume we need to fetch it from artifacts from this workflow
    if (!snapshotPath) {
      core.debug('Downloading current snapshots');

      // Download snapshots from current branch
      downloadResp = await downloadSnapshots({
        artifactName,
        rootDirectory: '/tmp/visual-snapshots',
      });
    }

    const current = snapshotPath || downloadResp?.downloadPath;

    if (!current) {
      const err = new Error(
        !snapshotPath
          ? '`snapshot-path` input not configured'
          : 'Unable to download current snapshots'
      );
      core.error(err);
      throw err;
    }

    const currentPath = path.resolve(GITHUB_WORKSPACE, current || '');

    core.debug('Starting diff of snapshots...');

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

    const gcsDestination = `${owner}/${repo}/${headSha}`;
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
        headSha,
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
      headSha,
      token: apiToken,
    });
  }
}

run();
