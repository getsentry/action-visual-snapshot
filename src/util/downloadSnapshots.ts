import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import {exec} from '@actions/exec';
import * as glob from '@actions/glob';

type DownloadSnapshotsParams = {
  rootDirectory: string;
  artifactName: string;
};

export async function downloadSnapshots({
  artifactName,
  rootDirectory,
}: DownloadSnapshotsParams) {
  core.startGroup(`downloadSnapshots: ${artifactName}`);
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

  await exec('pwd');

  // need to unzip everything now
  for (const file of tarFiles) {
    await exec('tar', ['zxf', file, '-C', resp.downloadPath]);
  }
  await exec('ls', ['-la', resp.downloadPath]);

  core.endGroup();
  return resp;
}
