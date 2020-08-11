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

  const tarGlobber = await glob.create(
    `${rootDirectory}/${artifactName}/snap*.tar.gz`,
    {
      followSymbolicLinks: false,
    }
  );
  const tarFiles = await tarGlobber.glob();

  await exec('pwd');

  await exec('cd', [`${rootDirectory}/${artifactName}`]);
  for (const file of tarFiles) {
    console.log(file);
    await exec('tar', ['zxf', file]);
  }
  // need to unzip everything now
  await exec('ls', [`${rootDirectory}/${artifactName}`]);

  return resp;
}
