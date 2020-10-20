import * as github from '@actions/github';
import {retrieveBaseSnapshots} from '@app/api/retrieveBaseSnapshots';
import * as doa from '@app/api/downloadOtherWorkflowArtifact';
import fetchWorkflowArtifact from 'github-fetch-workflow-artifact';

jest.mock('github-fetch-workflow-artifact', () => ({
  __esModule: true,
  default: jest.fn(),
}));

test('only downloads and returns base if base and merge base are the same', async function () {
  const octokit = github.getOctokit('token');
  jest.spyOn(doa, 'downloadOtherWorkflowArtifact');

  // @ts-ignore
  fetchWorkflowArtifact.mockImplementation(async () => ({
    artifact: {id: 9808919},
    workflowRun: {
      id: 152081708,
      head_sha: '5e19cbbea129a173dc79d4634df0fdaece933b06',
    },
  }));

  const results = await retrieveBaseSnapshots(octokit, {
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
    artifactName: 'visual-snapshots',
    branch: 'main',
    basePath: './base',
    mergeBasePath: './merge-base',
    mergeBaseSha: '5e19cbbea129a173dc79d4634df0fdaece933b06',
  });

  expect(doa.downloadOtherWorkflowArtifact).toHaveBeenCalledTimes(1);

  expect(doa.downloadOtherWorkflowArtifact).toHaveBeenCalledWith(octokit, {
    artifactName: 'visual-snapshots',
    branch: 'main',
    downloadPath: './base',
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
  });

  expect(results).toEqual([
    {
      artifact: expect.objectContaining({id: 9808919}),
      workflowRun: expect.objectContaining({id: 152081708}),
    },
    null,
  ]);
});

test('downloads and returns base and merge base', async function () {
  const octokit = github.getOctokit('token');
  jest.spyOn(doa, 'downloadOtherWorkflowArtifact');

  // @ts-ignore
  fetchWorkflowArtifact.mockImplementation(async () => ({
    artifact: {id: 9808919},
    workflowRun: {
      id: 152081708,
      head_sha: '5e19cbbea129a173dc79d4634df0fdaece933b06',
    },
  }));

  const results = await retrieveBaseSnapshots(octokit, {
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
    artifactName: 'visual-snapshots',
    branch: 'main',
    basePath: './base',
    mergeBasePath: './merge-base',
    mergeBaseSha: '11111111l129a173dc79d4634df0fdaece933b06',
  });

  expect(doa.downloadOtherWorkflowArtifact).toHaveBeenCalledTimes(2);
  expect(doa.downloadOtherWorkflowArtifact).toHaveBeenCalledWith(octokit, {
    artifactName: 'visual-snapshots',
    downloadPath: './base',
    branch: 'main',
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
  });

  expect(doa.downloadOtherWorkflowArtifact).toHaveBeenCalledWith(octokit, {
    artifactName: 'visual-snapshots',
    downloadPath: './merge-base',
    branch: 'main',
    commit: '11111111l129a173dc79d4634df0fdaece933b06',
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
  });

  expect(results).toHaveLength(2);
});
