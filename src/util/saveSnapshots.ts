import * as glob from '@actions/glob';
import * as artifact from '@actions/artifact';

type SaveSnapshotsParams = {
  rootDirectory: string;
  artifactName: string;
};

export async function saveSnapshots({
  artifactName,
  rootDirectory,
}: SaveSnapshotsParams) {
  const artifactClient = artifact.create();
  const currentGlobber = await glob.create(`${rootDirectory}/**/*.png`, {
    followSymbolicLinks: false,
  });
  const files = await currentGlobber.glob();

  return await artifactClient.uploadArtifact(
    artifactName,
    files,
    rootDirectory
  );
}
