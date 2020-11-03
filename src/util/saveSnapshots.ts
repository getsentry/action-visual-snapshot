import * as io from '@actions/io';
import * as core from '@actions/core';
import * as artifact from '@actions/artifact';
import {exec} from '@actions/exec';
import * as glob from '@actions/glob';

import {v4 as uuidv4} from 'uuid';

type SaveSnapshotsParams = {
  rootDirectory: string;
  artifactName: string;
};

export async function saveSnapshots({
  artifactName,
  rootDirectory,
}: SaveSnapshotsParams) {
  core.startGroup('saveSnapshots');
  try {
    const artifactClient = artifact.create();

    await exec('ls', [rootDirectory]);

    await io.mkdirP('/tmp/snaps');
    await exec('tar', [
      'czf',
      `/tmp/snaps/snap-${uuidv4()}.tar.gz`,
      '-C',
      rootDirectory,
      '.',
    ]);

    const tarGlobber = await glob.create('/tmp/snaps/*.tar.gz', {
      followSymbolicLinks: false,
    });

    const tarFiles = await tarGlobber.glob();

    const result = await artifactClient.uploadArtifact(
      artifactName,
      tarFiles,
      '/tmp/snaps'
    );
    core.endGroup();
    return result;
  } catch (err) {
    core.warning(err.message);
    core.endGroup();
    throw err;
  }
}
