/* eslint-env node */
import fetchWorkflowArtifact from 'github-fetch-workflow-artifact';
import {exec} from '@actions/exec';
import * as github from '@actions/github';
import * as glob from '@actions/glob';

export type DownloadArtifactParams = {
  owner: string;
  repo: string;
  downloadPath: string;
  workflow_id: string;
  artifactName: string;
  branch: string;
  commit?: string;
};

/**
 * Use GitHub API to fetch artifact download url, then
 * download and extract artifact to `downloadPath`
 */
export async function downloadOtherWorkflowArtifact(
  octokit: ReturnType<typeof github.getOctokit>,
  {
    owner,
    repo,
    workflow_id,
    branch,
    commit,
    downloadPath,
    artifactName,
  }: DownloadArtifactParams
) {
  const results = await fetchWorkflowArtifact(octokit, {
    owner,
    repo,
    workflow_id,
    branch,
    downloadPath,
    artifactName,
    commit,
  });

  // need to unzip everything now
  await exec('ls', [downloadPath]);

  const tarGlobber = await glob.create(`${downloadPath}/*.tar.gz`, {
    followSymbolicLinks: false,
  });

  const tarFiles = await tarGlobber.glob();

  await exec('pwd');

  // need to unzip everything now
  for (const tarFile of tarFiles) {
    await exec('tar', ['zxf', tarFile, '-C', downloadPath]);
  }
  await exec('ls', ['-la', downloadPath]);

  return results;
}
