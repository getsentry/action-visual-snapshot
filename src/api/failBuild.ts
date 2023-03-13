import bent from 'bent';
import * as github from '@actions/github';
import {API_ENDPOINT} from '@app/config';

type Octokit = ReturnType<typeof github.getOctokit>;

type Params = {
  octokit: Octokit;
  id: number;
  owner: string;
  repo: string;
  token: string;
  headSha: string;
};

/**
 * Fails a build due to another error
 */
export async function failBuild({token, octokit, ...body}: Params) {
  if (process.env.ACTION_LOCAL_RUN === 'true') {
    return;
  }

  const failureBody = {
    status: 'completed',
    conclusion: 'failure',
    title: 'Internal Error',
    summary: 'There was an error processing the snapshots',
  };

  if (token) {
    const put = bent(API_ENDPOINT, 'PUT', 'json', 200);

    return await put(
      '/build',
      {...body, ...failureBody},
      {
        'x-padding-token': token,
      }
    );
  }

  const {owner, repo, id} = body;

  const {title, summary, ...checkBody} = failureBody;

  return await octokit.rest.checks.update({
    check_run_id: id,
    owner,
    repo,
    ...checkBody,
    output: {
      title,
      summary,
    },
  });
}
