/* eslint-env node */
import path from 'path';
import os from 'os';
import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as github from '@actions/github';
import * as io from '@actions/io';
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
import {finishBuild, BuildResults} from './api/finishBuild';
import {failBuild} from './api/failBuild';
import {getOSTags} from './util/osTags';
import {SENTRY_DSN} from './config';
import {Await} from './types';
import {getODiffOptionsFromWorkflowInputs} from './getODiffOptionsFromWorkflowInputs';
import {downloadOtherWorkflowArtifact} from './api/downloadOtherWorkflowArtifact';
import {SpanStatus} from '@sentry/tracing';

// https://sharp.pixelplumbing.com/install#worker-threads
require('sharp');

function getParallelismInput() {
  const input = core.getInput('parallelism');

  if (typeof input === 'string') {
    const parsed = parseInt(input, 10);

    if (isNaN(parsed)) {
      core.debug('Invalid parallelism input, defaulting to CPU count');
      return os.cpus().length;
    }

    return parsed;
  }

  core.debug('No parallelism input, defaulting to CPU count');
  return os.cpus().length;
}

if (process.env.NODE_ENV !== 'test' && os.platform() !== 'linux') {
  throw new Error('This action is only supported on Linux');
}

const parallelism = getParallelismInput();
const {owner, repo} = github.context.repo;
const token = process.env.ACTION_GITHUB_TOKEN || core.getInput('github-token');
const octokit = token && github.getOctokit(token);
const {GITHUB_WORKSPACE, GITHUB_WORKFLOW} = process.env;
const pngGlob = '/**/*.png';
const shouldSaveOnly =
  process.env.ACTION_SAVE_ONLY || core.getInput('save-only');

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [
    new RewriteFrames({root: __dirname || process.cwd()}),
    new Sentry.Integrations.Http({tracing: true}),
  ],
  release: process.env.VERSION,
  tracesSampleRate: 1.0,
  environment:
    process.env.GITHUB_ACTION_REF === 'main' ? 'production' : 'development',
});

Sentry.setContext('actionEnvironment', {
  repo: process.env.GITHUB_REPOSITORY,
  ref: process.env.GITHUB_REF,
  head_ref: process.env.GITHUB_HEAD_REF,
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

function handleError(error: Error) {
  Sentry.captureException(error);
  core.setFailed(error.message);
}

function getGithubHeadRefInfo(): {headRef: string; headSha: string} {
  const workflowRunPayload = github.context.payload.workflow_run;
  const pullRequestPayload = github.context.payload.pull_request;
  const workflowRunPullRequest = workflowRunPayload?.pull_requests?.[0];

  const head_sha =
    pullRequestPayload?.head.sha ||
    workflowRunPullRequest?.head.sha ||
    workflowRunPayload?.head_sha ||
    github.context.sha;

  return {
    headRef:
      pullRequestPayload?.head.ref ||
      workflowRunPullRequest?.head.ref ||
      (workflowRunPayload?.head_branch &&
        `${workflowRunPayload?.head_repository?.full_name}/${workflowRunPayload?.head_branch}`) ||
      github.context.ref,
    headSha: head_sha,
  };
}

async function run(): Promise<void> {
  const resultsRootPath: string =
    process.env.ACTION_RESULTS_PATH || core.getInput('results-path');
  const baseBranch = core.getInput('base-branch');
  const baseArtifactName =
    process.env.ACTION_BASE_ARTIFACT_NAME ||
    core.getInput('base-artifact-name');
  const artifactName =
    process.env.ACTION_ARTIFACT_NAME || core.getInput('artifact-name');
  const gcsBucket = core.getInput('gcs-bucket');
  const apiToken =
    process.env.ACTION_GITHUB_TOKEN || core.getInput('api-token');
  const actionName = core.getInput('action-name');
  const snapshotPath: string =
    process.env.ACTION_SNAPSHOT_PATH || core.getInput('snapshot-path');

  const resultsPath = path.resolve(resultsRootPath, 'visual-snapshots-results');
  const tmpBasePath = path.resolve('/tmp/visual-snapshots-base');
  const mergeBasePath = path.resolve('/tmp/visual-snapshot-merge-base');

  const workflowRunPayload = github.context.payload.workflow_run;
  const pullRequestPayload = github.context.payload.pull_request;

  // We're only interested the first pull request... I'm not sure how there can be multiple
  // Forks do not have `pull_requests` populated...
  const workflowRunPullRequest = workflowRunPayload?.pull_requests?.[0];

  const {headRef, headSha} = getGithubHeadRefInfo();

  // TODO: Need a good merge base for forks as neither of the below values will exist (input not included)
  const mergeBaseSha: string =
    core.getInput('merge-base') ||
    pullRequestPayload?.base?.sha ||
    workflowRunPullRequest?.base.sha ||
    github.context.payload.before;

  // Forward `results-path` to outputs
  core.startGroup('Set outputs');
  core.setOutput('results-path', resultsRootPath);
  core.setOutput('base-images-path', tmpBasePath);
  core.setOutput('merge-base-images-path', mergeBasePath);
  core.endGroup();

  core.startGroup('github context');
  core.debug(`merge base: ${mergeBaseSha}`);
  core.debug(JSON.stringify(github.context, null, 2));
  core.endGroup();

  try {
    if (snapshotPath && !process.env.ACTION_LOCAL_RUN) {
      await saveSnapshots({
        artifactName,
        rootDirectory: snapshotPath,
      });
    }
  } catch (error) {
    handleError(error);
  } finally {
    // Only needs to upload snapshots, do not proceed further
    if (shouldSaveOnly !== 'false') {
      return;
    }
  }

  if (!octokit) {
    const error = new Error('`github-token` missing');
    handleError(error);
    throw error;
  }

  // This is intended to only work with pull requests, we should ignore `workflow_run` from pushes
  if (workflowRunPayload?.event === 'push') {
    core.debug(
      'Push event triggered `workflow_run`... skipping as this only works for PRs'
    );
    return;
  }

  const buildId = await startBuild({
    octokit,
    owner,
    repo,
    token: apiToken,
    headSha,
    headRef,
    name: actionName,
  });

  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
  try {
    let basePath = tmpBasePath;
    if (baseArtifactName) {
      const resp = await downloadSnapshots({
        artifactName: baseArtifactName,
        rootDirectory: tmpBasePath,
      });
      basePath = resp.downloadPath;
    } else {
      const [
        didDownloadLatest,
        didDownloadMergeBase,
      ] = await retrieveBaseSnapshots(octokit, {
        owner,
        repo,
        branch: baseBranch,
        workflow_id: `${workflowRunPayload?.name || GITHUB_WORKFLOW}.yml`,
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
    }

    let downloadResp: Await<ReturnType<typeof downloadSnapshots>> | null = null;

    // TODO maybe make this more explicit, but if snapshot path is not defined
    // we assume we need to fetch it from artifacts from this workflow
    if (!snapshotPath) {
      core.debug('Downloading current snapshots');

      const rootDirectory = '/tmp/visual-snapshots';

      if (github.context.eventName === 'workflow_run') {
        // TODO: fail the build if workflow_run.conclusion != 'success'
        // If this is called from a `workflow_run` event, then assume that the artifacts exist from that workflow run
        // TODO: I'm not sure what happens if there are multiple workflows defined (I assume it would get called multiple times?)
        const {data} = await octokit.rest.actions.listWorkflowRunArtifacts({
          owner,
          repo,
          run_id: workflowRunPayload?.id,
        });

        const artifact = data.artifacts.find(({name}) => name === artifactName);

        if (!artifact) {
          throw new Error(
            `Unable to find artifact from ${workflowRunPayload?.html_url}`
          );
        }

        downloadResp = await downloadOtherWorkflowArtifact(octokit, {
          owner,
          repo,
          artifactId: artifact.id,
          downloadPath: `${rootDirectory}/visual-snapshots`,
        });
      } else {
        downloadResp = await downloadSnapshots({
          artifactName,
          rootDirectory,
        });
      }
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

    core.startGroup('Starting diff of snapshots...');

    // Get odiff options from workflow inputs
    const diffOptions = getODiffOptionsFromWorkflowInputs();

    await io.mkdirP(resultsPath);

    const {
      baseFiles,
      changedSnapshots,
      missingSnapshots,
      newSnapshots,
      terminationReason,
    } = await diffSnapshots({
      basePath,
      mergeBasePath,
      currentPath,
      outputPath: resultsPath,
      diffOptions,
      parallelism,
    });

    const resultsGlobber = await glob.create(`${resultsPath}${pngGlob}`, {
      followSymbolicLinks: false,
    });
    const resultsFiles = await resultsGlobber.glob();

    const gcsSpan = transaction?.startChild({
      op: 'upload',
      description: 'Upload to GCS',
    });
    const gcsDestination = `${owner}/${repo}/${artifactName}/${headSha}`;
    const resultsArtifactUrls = await uploadToGcs({
      files: resultsFiles,
      root: resultsPath,
      bucket: gcsBucket,
      destinationRoot: `${gcsDestination}/results`,
    });
    gcsSpan?.finish();
    const results: BuildResults = {
      terminationReason,
      baseFilesLength: baseFiles.length,
      changed: [...changedSnapshots],
      missing: [...missingSnapshots],
      added: [...newSnapshots],
    };
    // This allows using Discover to distinguish transactions that require approval
    const {changed, missing} = results;
    if (changed.length + missing.length > 0) {
      transaction?.setTag('snapshots.approvalRequired', 'true');
    } else {
      transaction?.setTag('snapshots.approvalRequired', 'false');
    }
    core.info(`Results: ${JSON.stringify(results, null, 2)}`);
    core.endGroup();

    core.startGroup('Generating image gallery...');
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
    core.endGroup();

    const finishSpan = transaction?.startChild({
      op: 'finishing',
      description: 'Save snapshots and finish build',
    });
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
    finishSpan?.finish();
    // Setting the status correctly helps to distinguish transactions
    // that have failed rather than not
    transaction?.setStatus(SpanStatus.Ok);
  } catch (error) {
    core.debug('Top level error handling.');
    // This helps making this transaction count towards the failure rate
    transaction?.setStatus(SpanStatus.InternalError);
    handleError(error);
    failBuild({
      octokit,
      id: buildId,
      owner,
      repo,
      headSha,
      token: apiToken,
    });
    throw error;
  }
}

const {headRef, headSha} = getGithubHeadRefInfo();

const transaction = Sentry.startTransaction({
  op: shouldSaveOnly !== 'false' ? 'save snapshots' : 'run',
  // This is the title field in Discover
  name: shouldSaveOnly !== 'false' ? 'save snapshots' : 'run',
  tags: {
    head_ref: headRef,
    head_sha: headSha,
    diffing_library: 'odiff',
    ...getOSTags(),
  },
});

// Note that we set the transaction as the span on the scope.
// This step makes sure that if an error happens during the lifetime of the transaction
// the transaction context will be attached to the error event
Sentry.configureScope(scope => {
  scope.setSpan(transaction);
});

run().then(() => {
  core.debug('Finishing the transaction.');
  transaction.finish();
});
