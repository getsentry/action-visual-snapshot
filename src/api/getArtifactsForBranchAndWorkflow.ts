import {GetResponseDataTypeFromEndpointMethod} from '@octokit/types';
import * as core from '@actions/core';
import * as github from '@actions/github';

type Octokit = ReturnType<typeof github.getOctokit>;
type WorkflowRun = GetResponseDataTypeFromEndpointMethod<
  Octokit['actions']['listWorkflowRuns']
>['workflow_runs'][number];
type Artifacts = GetResponseDataTypeFromEndpointMethod<
  Octokit['actions']['listWorkflowRunArtifacts']
>['artifacts'][number];

export type GetArtifactsForBranchAndWorkflowReturn = {
  artifact: Artifacts;
  workflowRun: WorkflowRun;
} | null;

export type GetArtifactsForBranchAndWorkflow = {
  owner: string;
  repo: string;
  branch: string;
  workflow_id: string;
  artifactName: string;
  commit?: string;
};

/**
 * Fetch artifacts from a workflow run from a branch
 *
 * This is a bit hacky since GitHub Actions currently does not directly
 * support downloading artifacts from other workflows
 */
export async function getArtifactsForBranchAndWorkflow(
  octokit: Octokit,
  {
    owner,
    repo,
    workflow_id,
    branch,
    commit,
    artifactName,
  }: GetArtifactsForBranchAndWorkflow
): Promise<GetArtifactsForBranchAndWorkflowReturn> {
  core.debug(
    `Fetching workflow ${workflow_id} in branch: ${branch}${
      commit ? ` and commit: ${commit}` : ''
    }...`
  );

  const {
    data: {workflow_runs: workflowRuns},
  } = await octokit.actions.listWorkflowRuns({
    owner,
    repo,
    // Below is typed incorrectly, can accept string
    // @ts-ignore
    workflow_id,
    branch,
  });

  if (!workflowRuns.length) {
    core.warning(`Workflow ${workflow_id} not found in branch ${branch}`);
    return null;
  }

  // Either find a workflow run for a specific commit, or use the latest run
  // Make sure that the workflow run has completed, otherwise artifacts may not
  // be saved yet
  const workflowRunsForCommit = commit
    ? workflowRuns.filter(
        (run: typeof workflowRuns[number]) => run.head_sha === commit
      )
    : workflowRuns;

  const completedWorkflowRuns = workflowRunsForCommit.filter(isCompleted);

  if (!completedWorkflowRuns.length) {
    core.warning(
      `Workflow ${workflow_id} not found in branch: ${branch}${
        commit ? ` and commit: ${commit}` : ''
      }`
    );
    return null;
  }

  // Search through workflow artifacts until we find a workflow run w/ artifact name that we are looking for
  for (const workflowRun of completedWorkflowRuns) {
    core.debug(`Checking artifacts for  workflow run: ${workflowRun.html_url}`);

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
    } else {
      const foundArtifact = artifacts.find(({name}) => name === artifactName);
      if (foundArtifact) {
        core.debug(`Found suitable artifact: ${foundArtifact.url}`);
        return {
          artifact: foundArtifact,
          workflowRun,
        };
      }
    }
  }

  core.warning(`Artifact not found: ${artifactName}`);
  return null;
}

// It's possible we may only want when `run.conclusion === 'success'`
function isCompleted(run: WorkflowRun) {
  return run.status === 'completed';
}
