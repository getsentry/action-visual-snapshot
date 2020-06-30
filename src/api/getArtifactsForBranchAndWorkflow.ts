/* eslint-env node */
import * as core from '@actions/core';
import * as github from '@actions/github';

export type GetArtifactsForBranchAndWorkflow = {
  owner: string;
  repo: string;
  branch: string;
  workflow_id: string;
};

/**
 * Fetch artifacts from a workflow run from a branch
 *
 * This is a bit hacky since GitHub Actions currently does not directly
 * support downloading artifacts from other workflows
 */
export async function getArtifactsForBranchAndWorkflow(
  octokit: ReturnType<typeof github.getOctokit>,
  {owner, repo, workflow_id, branch}: GetArtifactsForBranchAndWorkflow
) {
  const {
    data: {
      workflow_runs: [workflowRun],
    },
  } = await octokit.actions.listWorkflowRuns({
    owner,
    repo,
    // Below is typed incorrectly, can accept string
    // @ts-ignore
    workflow_id,
    branch,
  });

  if (!workflowRun) {
    core.debug(`Workflow ${workflow_id} not found in branch ${branch}`);
    return null;
  }

  const {
    data: {artifacts},
  } = await octokit.actions.listWorkflowRunArtifacts({
    owner,
    repo,
    run_id: workflowRun.id,
  });

  if (!artifacts) {
    core.debug(
      `Unable to fetch artifacts for branch: ${branch}, workflow: ${workflow_id}, workflowRunId: ${workflowRun.id}`
    );
    return null;
  }

  return artifacts;
}
