/* eslint-env node */
import path from 'path';
import {exec} from '@actions/exec';
import * as github from '@actions/github';
import * as io from '@actions/io';

type DownloadArtifactParams = {
  owner: string;
  repo: string;
  artifactId: number;
  downloadPath: string;
};

const FILENAME = 'visual-snapshots-base.zip';

/**
 * Use GitHub API to fetch artifact download url, then
 * download and extract artifact to `downloadPath`
 */
export async function downloadOtherWorkflowArtifact(
  octokit: ReturnType<typeof github.getOctokit>,
  {owner, repo, artifactId, downloadPath}: DownloadArtifactParams
) {
  const artifact = await octokit.actions.downloadArtifact({
    owner,
    repo,
    artifact_id: artifactId,
    archive_format: 'zip',
  });

  // Make sure output path exists
  try {
    await io.mkdirP(downloadPath);
  } catch {
    // ignore errors
  }

  const downloadFile = path.resolve(downloadPath, FILENAME);

  await exec('curl', ['-L', '-o', downloadFile, artifact.url], {silent: true});
  await exec('unzip', ['-qq', '-d', downloadPath, downloadFile], {
    silent: true,
  });

  return true;
}
