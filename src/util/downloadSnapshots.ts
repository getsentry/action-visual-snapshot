import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import {exec} from '@actions/exec';
import * as glob from '@actions/glob';
import * as Sentry from '@sentry/node';

type DownloadSnapshotsParams = {
  rootDirectory: string;
  artifactName: string;
};

export async function downloadSnapshots({
  artifactName,
  rootDirectory,
}: DownloadSnapshotsParams) {
  const description = `downloadSnapshots: ${artifactName}`;
  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
  const span = transaction?.startChild({
    op: 'downloadSnapshots',
    description,
  });

  core.startGroup(description);
  const artifactClient = artifact.create();

  const resp = await artifactClient.downloadArtifact(
    artifactName,
    rootDirectory,
    {
      createArtifactFolder: true,
    }
  );

  // need to unzip everything now
  await exec('ls', [rootDirectory]);

  const tarGlobber = await glob.create(
    `${rootDirectory}/${artifactName}/snap*.tar.gz`,
    {
      followSymbolicLinks: false,
    }
  );
  const tarFiles = await tarGlobber.glob();

  // need to unzip everything now
  for (const file of tarFiles) {
    const tarSpan = transaction?.startChild({
      op: 'tar',
      description: file,
    });
    await exec('tar', ['zxf', file, '-C', resp.downloadPath]);
    tarSpan?.finish();
  }
  await exec('ls', ['-la', resp.downloadPath]);

  core.endGroup();
  span?.finish();
  return resp;
}
