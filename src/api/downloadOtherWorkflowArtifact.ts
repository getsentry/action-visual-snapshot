/* eslint-env node */
import path from 'path';
import retry from 'async-retry';

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

async function download(url: string, file: string, dest: string) {
  await exec('wget', [
    '-nv',
    '--retry-connrefused',
    '--waitretry=1',
    '--read-timeout=20',
    '--timeout=15',
    '-t',
    '0',
    '-O',
    file,
    url,
  ]);
  await exec('unzip', ['-q', '-d', dest, file], {
    silent: true,
  });
  return true;
}
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

  await retry(
    async () => await download(artifact.url, downloadFile, downloadPath),
    {
      onRetry: err => {
        console.error(err);
      },
    }
  );

  return true;
}
