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

  const tarGlobber = await glob.create(`${rootDirectory}/snaps*.tar.gz`, {
    followSymbolicLinks: false,
  });
  const tarFiles = await tarGlobber.glob();

  for (const file of tarFiles) {
    await exec('tar', ['zxf', file]);
  }
  // need to unzip everything now
  await exec('ls', [rootDirectory]);

  return resp;
}
