import * as io from '@actions/io';
import * as github from '@actions/github';
import * as exec from '@actions/exec';
import {downloadArtifact} from '@app/api/downloadArtifact';

jest.mock('path', () => ({
  resolve: () => '/',
}));

jest.mock('@app/api/fetchArtifactFromBranch', () => ({
  fetchArtifactFromBranch: jest.fn(() =>
    Promise.resolve({
      url: 'http://artifact-download',
    })
  ),
}));

jest.mock('@actions/io', () => ({
  mkdirP: jest.fn(() => Promise.resolve()),
}));
jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

test('downloads and extracts artifact', async function() {
  const octokit = github.getOctokit('token');

  const downloadResult = await downloadArtifact(octokit, {
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
    branch: 'main',
    artifactName: 'visual-snapshots',
    downloadPath: '.artifacts',
  });

  expect(io.mkdirP).toHaveBeenCalledWith('.artifacts');
  expect(exec.exec).toHaveBeenCalledWith(
    'curl -L -o / http://artifact-download'
  );
  expect(exec.exec).toHaveBeenCalledWith('unzip -d .artifacts /');

  expect(downloadResult).toBe(true);
});
