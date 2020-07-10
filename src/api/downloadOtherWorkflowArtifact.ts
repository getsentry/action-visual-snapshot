/* eslint-env node */
import path from 'path';
import {exec} from '@actions/exec';
import * as github from '@actions/github';
import * as io from '@actions/io';
import {
  fetchArtifactFromBranch,
  FetchArtifactFromBranchParams,
} from './fetchArtifactFromBranch';

type DownloadArtifactParams = {
  artifactName: string;
  downloadPath: string;
} & FetchArtifactFromBranchParams;

const FILENAME = 'visual-snapshots-base.zip';

/**
 * Use GitHub API to fetch artifacts for a workflow from a specific branch
 *
 * Then download and extract artifact to `downloadPath`
 */
export async function downloadOtherWorkflowArtifact(
  octokit: ReturnType<typeof github.getOctokit>,
  {
    owner,
    repo,
    artifactName,
    workflow_id,
    branch,
    downloadPath,
    commit,
  }: DownloadArtifactParams
) {
  const artifact = await fetchArtifactFromBranch(octokit, {
    owner,
    repo,
    artifactName,
    workflow_id,
    branch,
    commit,
  });

  if (!artifact) {
    return null;
  }

  // Make sure output path exists
  await io.mkdirP(downloadPath);

  const downloadFile = path.resolve(downloadPath, FILENAME);

  await exec('curl', ['-L', '-o', downloadFile, artifact.url], {silent: true});
  await exec('unzip', ['-d', downloadPath, downloadFile], {silent: true});

  return true;
}
