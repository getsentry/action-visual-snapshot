import bent from 'bent';

const post = bent('https://bv.ngrok.io/api', 'POST', 'json', 200);

type Params = {
  owner: string;
  repo: string;
  token: string;
  head_sha: string;
};

export async function startBuild({
  owner,
  repo,
  token,
  head_sha,
}: Params): Promise<any> {
  return await post(
    '/build',
    {owner, repo, head_sha},
    {
      'x-padding-token': token,
    }
  );
}
