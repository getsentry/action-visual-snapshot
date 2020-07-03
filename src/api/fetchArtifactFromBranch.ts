/* eslint-env node */
import * as core from '@actions/core';
import * as github from '@actions/github';

import {
  getArtifactsForBranchAndWorkflow,
  GetArtifactsForBranchAndWorkflow,
} from './getArtifactsForBranchAndWorkflow';

export type FetchArtifactFromBranchParams = {
  artifactName: string;
} & GetArtifactsForBranchAndWorkflow;

export async function fetchArtifactFromBranch(
  octokit: ReturnType<typeof github.getOctokit>,
  {
    owner,
    repo,
    artifactName,
    workflow_id,
    branch,
    commit,
  }: FetchArtifactFromBranchParams
) {
  const artifacts = await getArtifactsForBranchAndWorkflow(octokit, {
    owner,
    repo,
    workflow_id,
    branch,
    commit,
  });

  if (!artifacts) {
    return null;
  }

  // filter artifacts for `artifactName`
  const mainSnapshotArtifact = artifacts.find(
    artifact => artifact.name === artifactName
  );

  if (!mainSnapshotArtifact) {
    core.debug(`Artifact not found: ${artifactName}`);
    return null;
  }

  // Get artifact download URL
  const artifact = await octokit.actions.downloadArtifact({
    owner,
    repo,
    artifact_id: mainSnapshotArtifact.id,
    archive_format: 'zip',
  });

  return artifact;
}
