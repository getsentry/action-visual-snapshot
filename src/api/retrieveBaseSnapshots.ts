import * as core from '@actions/core';
import * as github from '@actions/github';

import {
  getArtifactsForBranchAndWorkflow,
  GetArtifactsForBranchAndWorkflow,
} from './getArtifactsForBranchAndWorkflow';
import {downloadOtherWorkflowArtifact} from './downloadOtherWorkflowArtifact';

type GetArtifactsForBranchAndWorkflowType = Await<
  ReturnType<typeof getArtifactsForBranchAndWorkflow>
> | null;

type RetrieveBaseSnapshotsParams = {
  basePath: string;
  mergeBasePath: string;
  mergeBaseSha: string;
} & GetArtifactsForBranchAndWorkflow;

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
  const baseArtifacts = await getArtifactsForBranchAndWorkflow(octokit, {
    owner,
    repo,
    workflow_id,
    branch,
    artifactName,
  });

  if (!baseArtifacts) {
    return [];
  }

  await downloadOtherWorkflowArtifact(octokit, {
    owner,
    repo,
    artifactId: baseArtifacts.artifact.id,
    downloadPath: basePath,
  });

  let mergeBaseArtifacts: GetArtifactsForBranchAndWorkflowType = null;

  if (baseArtifacts.workflowRun.head_sha !== mergeBaseSha) {
    mergeBaseArtifacts = await getArtifactsForBranchAndWorkflow(octokit, {
      owner,
      repo,
      workflow_id,
      branch,
      commit: mergeBaseSha,
      artifactName,
    });

    if (mergeBaseArtifacts) {
      await downloadOtherWorkflowArtifact(octokit, {
        owner,
        repo,
        artifactId: mergeBaseArtifacts.artifact.id,
        downloadPath: mergeBasePath,
      });
    }
  } else {
    core.debug('Merge base is the same as base');
  }

  return [baseArtifacts, mergeBaseArtifacts];
}
