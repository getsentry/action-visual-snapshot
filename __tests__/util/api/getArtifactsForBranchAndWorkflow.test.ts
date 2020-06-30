import * as github from '@actions/github';
import {getArtifactsForBranchAndWorkflow} from '@app/api/getArtifactsForBranchAndWorkflow';

test('it gets workflow runs and a branch and workflow id and then gets artifacts for first workflow run found', async function() {
  const octokit = github.getOctokit('token');

  const artifacts = await getArtifactsForBranchAndWorkflow(octokit, {
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
    branch: 'main',
  });

  expect(octokit.actions.listWorkflowRuns).toHaveBeenCalledWith({
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
    branch: 'main',
  });

  expect(octokit.actions.listWorkflowRunArtifacts).toHaveBeenCalledWith({
    owner: 'getsentry',
    repo: 'sentry',
    run_id: 152081708,
  });

  expect(artifacts?.[0]).toMatchObject({
    url:
      'https://api.github.com/repos/billyvg/sentry/actions/artifacts/9808919',
  });
});
