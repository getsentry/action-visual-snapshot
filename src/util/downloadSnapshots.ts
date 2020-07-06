import * as artifact from '@actions/artifact';

type DownloadSnapshotsParams = {
  rootDirectory: string;
  artifactName: string;
};

export async function downloadSnapshots({
  artifactName,
  rootDirectory,
}: DownloadSnapshotsParams) {
  const artifactClient = artifact.create();

  return await artifactClient.downloadArtifact(artifactName, rootDirectory, {
    createArtifactFolder: true,
  });
}
