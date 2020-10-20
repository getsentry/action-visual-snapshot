import * as core from '@actions/core';
import * as github from '@actions/github';

import {NoArtifactsError} from 'github-fetch-workflow-artifact';

import {Await} from '@app/types';

import {
  downloadOtherWorkflowArtifact,
  DownloadArtifactParams,
} from './downloadOtherWorkflowArtifact';

type DownloadOtherWorkflowArtifact = Await<
  ReturnType<typeof downloadOtherWorkflowArtifact>
> | null;

type RetrieveBaseSnapshotsParams = {
  basePath: string;
  mergeBasePath: string;
  mergeBaseSha: string;
} & Omit<DownloadArtifactParams, 'downloadPath'>;

// We should make sure that merge base is different from base
export async function retrieveBaseSnapshots(
  octokit: ReturnType<typeof github.getOctokit>,
  {
    owner,
    repo,
    artifactName,
    workflow_id,
    branch,
    basePath,
    mergeBasePath,
    mergeBaseSha,
  }: RetrieveBaseSnapshotsParams
) {
  let baseArtifacts;

  try {
    baseArtifacts = await downloadOtherWorkflowArtifact(octokit, {
      owner,
      repo,
      workflow_id,
      branch,
      downloadPath: basePath,
      artifactName,
    });
  } catch (err) {
    console.error(err);
    if (err instanceof NoArtifactsError) {
      return [];
    }
  }

  // This shouldn't happen, just making ts happy
  if (!baseArtifacts) {
    return [];
  }

  const {
    head_repository, // eslint-disable-line @typescript-eslint/no-unused-vars
    repository, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...workflowRun
  } = baseArtifacts.workflowRun;

  let mergeBaseArtifacts: DownloadOtherWorkflowArtifact = null;

  if (workflowRun.head_sha !== mergeBaseSha) {
    mergeBaseArtifacts = await downloadOtherWorkflowArtifact(octokit, {
      owner,
      repo,
      workflow_id,
      branch,
      downloadPath: mergeBasePath,
      commit: mergeBaseSha,
      artifactName,
    });
  } else {
    core.debug('Merge base is the same as base');
  }

  return [baseArtifacts, mergeBaseArtifacts];
}
