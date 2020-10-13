import * as github from '@actions/github';
import * as exec from '@actions/exec';
import * as glob from '@actions/glob';
import {downloadOtherWorkflowArtifact} from '@app/api/downloadOtherWorkflowArtifact';

jest.mock('path', () => ({
  resolve: () => '/',
  dirname: () => '/dirname',
  basename: () => '/basename',
}));

jest.mock('@actions/io', () => ({
  mkdirP: jest.fn(async () => Promise.resolve()),
}));

jest.mock('@actions/exec', () => ({
  exec: jest.fn(),
}));

jest.mock('@actions/glob', () => ({
  create: jest.fn(async () => {}),
}));

jest.mock('github-fetch-workflow-artifact', () => ({
  __esModule: true,
  default: jest.fn(async () => ({artifact: {}, workflowRun: {}})),
}));

test('downloads and extracts artifact', async function () {
  const octokit = github.getOctokit('token');

  jest.spyOn(glob, 'create');
  (glob.create as jest.Mock).mockImplementation(async () => ({
    glob: jest.fn(async () => ['foo.tar.gz', 'bar.tar.gz']),
  }));

  const downloadResult = await downloadOtherWorkflowArtifact(octokit, {
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'workflow_id',
    branch: 'main',
    artifactName: 'artifactName',
    downloadPath: '.artifacts',
  });

  // It should glob for all `.tar.gz` in the `downloadPath`
  expect(glob.create).toHaveBeenCalledWith(
    '.artifacts/*.tar.gz',
    expect.anything()
  );

  expect(exec.exec).toHaveBeenCalledWith('tar', [
    'zxf',
    'foo.tar.gz',
    '-C',
    '.artifacts',
  ]);
  expect(exec.exec).toHaveBeenCalledWith('tar', [
    'zxf',
    'bar.tar.gz',
    '-C',
    '.artifacts',
  ]);

  expect(downloadResult.artifact).not.toBeFalsy();
  expect(downloadResult.workflowRun).not.toBeFalsy();
});
