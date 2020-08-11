import * as core from '@actions/core';
import * as io from '@actions/io';
import * as artifact from '@actions/artifact';
import {exec} from '@actions/exec';
import * as glob from '@actions/glob';

type SaveSnapshotsParams = {
  rootDirectory: string;
  artifactName: string;
};

export async function saveSnapshots({
  artifactName,
  rootDirectory,
}: SaveSnapshotsParams) {
  try {
    const artifactClient = artifact.create();
    // const currentGlobber = await glob.create(`${rootDirectory}/**/*.png`, {
    // followSymbolicLinks: false,
    // });
    // const files = await currentGlobber.glob();

    await io.mkdirP('/tmp/snaps');
    await exec('tar', [
      'czf',
      `/tmp/snaps/snap-${Math.floor(Math.random() * 10000)}.tar.gz`,
      rootDirectory,
    ]);

    const tarGlobber = await glob.create('/tmp/snaps/*.tar.gz', {
      followSymbolicLinks: false,
    });

    const tarFiles = await tarGlobber.glob();

    return await artifactClient.uploadArtifact(
      artifactName,
      tarFiles,
      '/tmp/snaps'
    );
  } catch (err) {
    core.warning(err.message);
    if (!err.message.includes('Unprocessable Entity')) {
      // throw err;
    }

    return null;
  }
}
