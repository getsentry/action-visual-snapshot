import bent from 'bent';
import * as core from '@actions/core';
import * as github from '@actions/github';
import {API_ENDPOINT} from '@app/config';

type Octokit = ReturnType<typeof github.getOctokit>;

type Params = {
  octokit: Octokit;
  owner: string;
  repo: string;
  token: string;
  headSha: string;
  headRef: string;
  name: string;
};

export async function startBuild({
  octokit,
  owner,
  repo,
  token,
  headSha: head_sha,
  headRef: head_ref,
  name = 'Visual Snapshot',
}: Params): Promise<any> {
  core.startGroup('Starting build');
  try {
    if (token) {
      core.debug('Starting build using API...');
      const post = bent(API_ENDPOINT, 'POST', 'json', 200);

      core.endGroup();
      return await post(
        '/build',
        {owner, repo, head_sha, head_ref},
        {
          'x-padding-token': token,
        }
      );
    }
  } catch (err) {
    core.debug(`Error using API: ${err}`);
  } finally {
    core.debug('Using GitHub API directly...');
    const {data: check} = await octokit.checks.create({
      owner,
      repo,
      head_sha,
      name,
      status: 'in_progress',
    });

    core.endGroup();
    return check.id;
  }
}
