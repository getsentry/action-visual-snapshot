import {GetResponseDataTypeFromEndpointMethod} from '@octokit/types';
import * as core from '@actions/core';
import * as github from '@actions/github';

type Octokit = ReturnType<typeof github.getOctokit>;
type WorkflowRun = GetResponseDataTypeFromEndpointMethod<
  Octokit['rest']['actions']['listWorkflowRuns']
>['workflow_runs'][number];
type Artifacts = GetResponseDataTypeFromEndpointMethod<
  Octokit['rest']['actions']['listWorkflowRunArtifacts']
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
  core.startGroup(
    `getArtifactsForBranchAndWorkflow - workflow:"${workflow_id}",  branch:"${branch}"${
      commit ? `,  commit:"${commit}"` : ''
    }`
  );

  const {
    data: {workflow_runs: workflowRuns},
  } = await octokit.rest.actions.listWorkflowRuns({
    owner,
    repo,
    // Below is typed incorrectly, it needs to be a string but typed as number
    workflow_id,
    branch,
    status: 'success',

    // GitHub API treats `head_sha` with explicit `undefined` value differently
    // than when `head_sha` does not exist in object. Want the latter.
    ...(commit ? {head_sha: commit} : {}),
  });

  if (!workflowRuns.length) {
    core.warning(
      `Workflow ${workflow_id} not found in branch: ${branch}${
        commit ? ` and commit: ${commit}` : ''
      }`
    );
    core.endGroup();
    return null;
  }

  // XXX: This function is only used by `retrieveBaseSnapshots`, which means that base snapshots
  // should only be used from the workflow org/repo and not from forks, as they can create
  // a pull request that uses the base branch name.
  //
  // If this needs to be more generic, this should be an option.
  const completedWorkflowRuns = workflowRuns.filter(
    workflowRun => workflowRun.head_repository.full_name === `${owner}/${repo}`
  );

  // Search through workflow artifacts until we find a workflow run w/ artifact name that we are looking for
  for (const workflowRun of completedWorkflowRuns) {
    core.debug(`Checking artifacts for workflow run: ${workflowRun.html_url}`);

    const {
      data: {artifacts},
    } = await octokit.rest.actions.listWorkflowRunArtifacts({
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
        core.endGroup();
        return {
          artifact: foundArtifact,
          workflowRun,
        };
      }
    }
  }

  core.warning(`Artifact not found: ${artifactName}`);
  core.endGroup();
  return null;
}
