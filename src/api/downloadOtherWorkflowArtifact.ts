/* eslint-env node */
import path from 'path';

import {exec} from '@actions/exec';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as io from '@actions/io';
import * as glob from '@actions/glob';
import * as Sentry from '@sentry/node';

type DownloadArtifactParams = {
  owner: string;
  repo: string;
  artifactId: number;
  downloadPath: string;
};

const FILENAME = 'visual-snapshots-base.zip';

async function download(url: string, file: string, dest: string) {
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
  const span = transaction?.startChild({
    op: 'download',
    description: `download ${file}`,
  });

  core.startGroup(`download ${file}`);
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

  // need to unzip everything now
  await exec('ls', [dest]);

  const tarGlobber = await glob.create(`${dest}/*.tar.gz`, {
    followSymbolicLinks: false,
  });

  const tarFiles = await tarGlobber.glob();

  // need to unzip everything now
  for (const tarFile of tarFiles) {
    await exec('tar', ['zxf', tarFile, '-C', dest]);
  }
  await exec('ls', ['-la', dest]);

  core.endGroup();
  span?.finish();
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

  return await download(artifact.url, downloadFile, downloadPath);
}
