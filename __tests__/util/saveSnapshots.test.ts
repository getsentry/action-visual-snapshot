import {saveSnapshots} from '@app/util/saveSnapshots';

import * as artifact from '@actions/artifact';
import {exec} from '@actions/exec';

jest.mock('@actions/io', () => ({
  mkdirP: jest.fn(async () => Promise.resolve()),
}));

jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

jest.mock('@actions/glob', () => ({
  create: jest.fn(() => ({
    glob: jest.fn(() => ['foo', 'bar']),
  })),
}));

describe('saveSnapshots', function () {
  it('saves successfully', async function () {
    const uploadMock = jest.fn();

    jest.spyOn(artifact, 'create').mockImplementation(() => ({
      uploadArtifact: uploadMock,
      downloadArtifact: jest.fn(),
      downloadAllArtifacts: jest.fn(),
    }));

    await saveSnapshots({
      artifactName: 'artifactName',
      rootDirectory: '/root',
    });

    expect(exec).toHaveBeenCalledWith('tar', [
      'czf',
      expect.stringMatching('/tmp/snaps/snap-'),
      '-C',
      '/root',
      '.',
    ]);

    expect(uploadMock).toHaveBeenCalledWith(
      'artifactName',
      ['foo', 'bar'],
      '/tmp/snaps'
    );
  });

  it('retries until successful', async function () {
    const uploadMock = jest.fn(() => {
      throw new Error('read ECONNRESET');
    });
    let retryCount = -1;

    jest.spyOn(artifact, 'create').mockImplementation(() => ({
      uploadArtifact: () => {
        retryCount++;
        if (retryCount === 3) {
          // @ts-ignore
          uploadMock.mockImplementationOnce(() => {});
        }
        return uploadMock();
      },
      downloadArtifact: jest.fn(),
      downloadAllArtifacts: jest.fn(),
    }));

    await saveSnapshots({
      artifactName: 'artifactName',
      rootDirectory: '/root',
    });

    expect(uploadMock).toHaveBeenCalledTimes(4);
  });

  it('retries for 5 attempts', async function () {
    const uploadMock = jest.fn(() => {
      throw new Error('read ECONNRESET');
    });
    jest.spyOn(artifact, 'create').mockImplementation(() => ({
      uploadArtifact: uploadMock,
      downloadArtifact: jest.fn(),
      downloadAllArtifacts: jest.fn(),
    }));

    expect(async () =>
      saveSnapshots({
        artifactName: 'artifactName',
        rootDirectory: '/root',
      })
    ).rejects.toThrowError('Unable to save snapshots after 5 attempts');
  });
});
