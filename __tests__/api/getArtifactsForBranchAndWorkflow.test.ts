import * as github from '@actions/github';
import {getArtifactsForBranchAndWorkflow} from '@app/api/getArtifactsForBranchAndWorkflow';

test('it gets workflow runs and a branch and workflow id and then gets artifacts for first workflow run found', async function () {
  const octokit = github.getOctokit('token');

  const results = await getArtifactsForBranchAndWorkflow(octokit, {
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
    branch: 'main',
    artifactName: 'visual-snapshots',
  });

  expect(octokit.actions.listWorkflowRuns).toHaveBeenCalledWith({
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
    branch: 'main',
    per_page: 100,
    status: 'completed',
  });

  expect(octokit.actions.listWorkflowRunArtifacts).toHaveBeenCalledWith({
    owner: 'getsentry',
    repo: 'sentry',
    run_id: 152081708,
  });

  expect(results?.artifact).toMatchObject({
    url:
      'https://api.github.com/repos/getsentry/sentry/actions/artifacts/9808919',
  });
});
