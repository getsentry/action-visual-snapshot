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

async function _save({rootDirectory, artifactName}: SaveSnapshotsParams) {
  const artifactClient = artifact.create();

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
  return result;
}

/**
 * Use GitHub's artifact library to upload artifacts
 *
 * GHA has a tendency to fail with `ECONNRESET`, in this case retry up to 5 times.
 */
export async function saveSnapshots({
  artifactName,
  rootDirectory,
}: SaveSnapshotsParams) {
  core.startGroup('saveSnapshots');
  let retries = 5;

  while (retries > 0) {
    try {
      const result = await _save({artifactName, rootDirectory});
      core.endGroup();
      return result;
    } catch (err) {
      if (!err.message.includes('ECONNRESET')) {
        core.endGroup();
        throw err;
      }
    } finally {
      retries--;
    }
  }
  core.endGroup();
  throw new Error('Unable to save snapshots after 5 attempts');
}
