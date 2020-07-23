import * as io from '@actions/io';
import * as github from '@actions/github';
import * as exec from '@actions/exec';
import {downloadOtherWorkflowArtifact} from '@app/api/downloadOtherWorkflowArtifact';

jest.mock('path', () => ({
  resolve: () => '/',
}));

jest.mock('@actions/io', () => ({
  mkdirP: jest.fn(async () => Promise.resolve()),
}));
jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

test('downloads and extracts artifact', async function() {
  const octokit = github.getOctokit('token');

  const downloadResult = await downloadOtherWorkflowArtifact(octokit, {
    owner: 'getsentry',
    repo: 'sentry',
    artifactId: 9808919,
    downloadPath: '.artifacts',
  });

  expect(io.mkdirP).toHaveBeenCalledWith('.artifacts');
  expect(exec.exec).toHaveBeenCalledWith('curl', [
    '-L',
    '-o',
    '/',
    'https://pipelines.actions.githubusercontent.com/fVNRiR9dLg3DkWCpAUCEq7qRezdKTcYtICIqwx0vWs6L0oyqxQ/_apis/pipelines/1/runs/487/signedartifactscontent?artifactName=visual-snapshots&urlExpires=2020-06-30T00%3A19%3A19.8133132Z&urlSigningMethod=HMACV1&urlSignature=12tWt93zqyKS9Fy7IMRj1NGHxGn07YTDwOZT988hCAI%3D',
  ]);
  expect(exec.exec).toHaveBeenCalledWith(
    'unzip',
    ['-q', '-d', '.artifacts', '/'],
    {
      silent: true,
    }
  );

  expect(downloadResult).toBe(true);
});
