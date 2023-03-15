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
  if (process.env.ACTION_LOCAL_RUN === 'true') {
    return null;
  }

  try {
    if (!token) {
      throw new Error('No API token');
    }

    core.startGroup('Starting build using API...');
    const post = bent(API_ENDPOINT, 'POST', 'json', 200);

    core.debug(`sha/ref: ${head_ref}, ${head_sha}`);
    const result = await post(
      '/build',
      {owner, repo, head_sha, head_ref, github_check_name: name},
      {
        'x-padding-token': token,
      }
    );
    core.endGroup();
    return result;
  } catch (err) {
    core.startGroup('Error starting build with API');
    core.debug(err);
    core.endGroup();

    core.startGroup('Starting build using GitHub API directly...');
    const {data: check} = await octokit.rest.checks.create({
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
