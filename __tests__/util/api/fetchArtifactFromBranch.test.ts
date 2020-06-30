import * as github from '@actions/github';
import {fetchArtifactFromBranch} from '@app/api/fetchArtifactFromBranch';

test('fetches artifact data from branch', async function() {
  const octokit = github.getOctokit('token');

  const artifact = await fetchArtifactFromBranch(octokit, {
    owner: 'getsentry',
    repo: 'sentry',
    workflow_id: 'acceptance.yml',
    branch: 'main',
    artifactName: 'visual-snapshots',
  });

  expect(octokit.actions.downloadArtifact).toHaveBeenCalledWith(
    expect.objectContaining({
      owner: 'getsentry',
      repo: 'sentry',
      artifact_id: 9808919,
    })
  );

  expect(artifact).toMatchObject({
    status: 200,
    url:
      'https://pipelines.actions.githubusercontent.com/fVNRiR9dLg3DkWCpAUCEq7qRezdKTcYtICIqwx0vWs6L0oyqxQ/_apis/pipelines/1/runs/487/signedartifactscontent?artifactName=visual-snapshots&urlExpires=2020-06-30T00%3A19%3A19.8133132Z&urlSigningMethod=HMACV1&urlSignature=12tWt93zqyKS9Fy7IMRj1NGHxGn07YTDwOZT988hCAI%3D',
    data: {},
  });
});
