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

// max pages of workflows to pagination through
const MAX_PAGES = 10;
const PER_PAGE_LIMIT = 10;

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

  let currentPage = 0;
  let completedWorkflowRuns: WorkflowRun[] = [];

  for await (const response of octokit.paginate.iterator(
    octokit.actions.listWorkflowRuns,
    {
      owner,
      repo,
      // Below is typed incorrectly, it needs to be a string but typed as number
      workflow_id: (workflow_id as unknown) as number,
      branch,
      status: 'completed',
      per_page: PER_PAGE_LIMIT,
    }
  )) {
    if (!response.data.length) {
      core.warning(`Workflow ${workflow_id} not found in branch ${branch}`);
      core.endGroup();
      return null;
    }

    // XXX: This function is only used by `retrieveBaseSnapshots`, which means that base snapshots
    // should only be used from the workflow org/repo and not from forks, as they can create
    // a pull request that uses the base branch name.
    //
    // If this needs to be more generic, this should be an option.
    const workflowRuns = response.data.filter(
      workflowRun =>
        workflowRun.head_repository.full_name === `${owner}/${repo}`
    );

    const workflowRunsForCommit = commit
      ? workflowRuns.filter(
          (run: typeof workflowRuns[number]) => run.head_sha === commit
        )
      : workflowRuns;

    if (workflowRunsForCommit.length) {
      completedWorkflowRuns = completedWorkflowRuns.concat(
        workflowRunsForCommit
      );
      break;
    }

    if (currentPage > MAX_PAGES) {
      core.warning(
        `Workflow ${workflow_id} not found in branch: ${branch}${
          commit ? ` and commit: ${commit}` : ''
        }`
      );
      core.endGroup();
      return null;
    }

    currentPage++;
  }

  // Search through workflow artifacts until we find a workflow run w/ artifact name that we are looking for
  for (const workflowRun of completedWorkflowRuns) {
    core.debug(`Checking artifacts for workflow run: ${workflowRun.html_url}`);

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
