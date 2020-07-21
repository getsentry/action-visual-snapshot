import bent from 'bent';
import * as github from '@actions/github';
import {API_ENDPOINT} from '@app/config';

type Octokit = ReturnType<typeof github.getOctokit>;

type Params = {
  octokit: Octokit;
  owner: string;
  repo: string;
  token: string;
  head_sha: string;
};

export async function startBuild({
  octokit,
  owner,
  repo,
  token,
  head_sha,
}: Params): Promise<any> {
  if (token) {
    const post = bent(API_ENDPOINT, 'POST', 'json', 200);
    return await post(
      '/build',
      {owner, repo, head_sha},
      {
        'x-padding-token': token,
      }
    );
  }

  const {data: check} = await octokit.checks.create({
    owner,
    repo,
    head_sha,
    name: 'Visual Snapshot',
    status: 'in_progress',
  });

  return check.id;
}
