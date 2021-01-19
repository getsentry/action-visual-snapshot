import * as github from '@actions/github';
import {retrieveBaseSnapshots} from '@app/api/retrieveBaseSnapshots';
import {downloadOtherWorkflowArtifact} from '@app/api/downloadOtherWorkflowArtifact';

jest.mock('@app/api/downloadOtherWorkflowArtifact', () => ({
  downloadOtherWorkflowArtifact: jest.fn(),
}));

test('only downloads and returns base if base and merge base are the same', async function() {
  const octokit = github.getOctokit('token');

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

  expect(octokit.actions.listWorkflowRuns).toHaveBeenCalledWith({
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
    branch: 'main',
    per_page: 10,
    status: 'completed',
  });

  expect(octokit.actions.listWorkflowRunArtifacts).toHaveBeenCalledWith({
    owner: 'getsentry',
    repo: 'sentry',
    run_id: 152081708,
  });

  expect(octokit.actions.listWorkflowRuns).toHaveBeenCalledTimes(1);

  expect(downloadOtherWorkflowArtifact).toHaveBeenCalledTimes(1);
  expect(downloadOtherWorkflowArtifact).toHaveBeenCalledWith(octokit, {
    artifactId: 9808919,
    downloadPath: './base',
    owner: 'getsentry',
    repo: 'sentry',
  });

  expect(results).toEqual([
    {
      artifact: expect.objectContaining({id: 9808919}),
      workflowRun: expect.objectContaining({id: 152081708}),
    },
    null,
  ]);
});

test('downloads and returns base and merge base', async function() {
  const octokit = github.getOctokit('token');

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

  expect(octokit.actions.listWorkflowRuns).toHaveBeenCalledTimes(2);
  expect(octokit.actions.listWorkflowRuns).toHaveBeenCalledWith({
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
    branch: 'main',
    per_page: 10,
    status: 'completed',
  });

  expect(octokit.actions.listWorkflowRunArtifacts).toHaveBeenCalledWith({
    owner: 'getsentry',
    repo: 'sentry',
    run_id: 152081708,
  });

  expect(octokit.actions.listWorkflowRunArtifacts).toHaveBeenCalledWith({
    owner: 'getsentry',
    repo: 'sentry',
    run_id: 152081707,
  });

  expect(downloadOtherWorkflowArtifact).toHaveBeenCalledTimes(2);
  expect(downloadOtherWorkflowArtifact).toHaveBeenCalledWith(octokit, {
    artifactId: 9808919,
    downloadPath: './base',
    owner: 'getsentry',
    repo: 'sentry',
  });

  expect(downloadOtherWorkflowArtifact).toHaveBeenCalledWith(octokit, {
    artifactId: 8808920,
    downloadPath: './merge-base',
    owner: 'getsentry',
    repo: 'sentry',
  });
  expect(results).toEqual([
    {
      artifact: expect.objectContaining({id: 9808919}),
      workflowRun: expect.objectContaining({id: 152081708}),
    },
    {
      artifact: expect.objectContaining({id: 8808920}),
      workflowRun: expect.objectContaining({id: 152081707}),
    },
  ]);
});
