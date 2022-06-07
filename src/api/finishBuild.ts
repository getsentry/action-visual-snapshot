import bent from 'bent';
import * as github from '@actions/github';
import {API_ENDPOINT} from '@app/config';

type Octokit = ReturnType<typeof github.getOctokit>;

export interface BuildResults {
  terminationReason: 'maxChangedSnapshots' | null;
  baseFilesLength: number;
  changed: string[];
  missing: string[];
  added: string[];
}

type Params = {
  octokit: Octokit;
  id: number;
  owner: string;
  repo: string;
  headSha: string;
  token: string;
  images: {
    alt: string;
    image_url: string;
  }[];
  results: BuildResults;
  galleryUrl?: string;
};

export async function finishBuild({token, ...body}: Params) {
  console.log('Finishing build');
  try {
    if (!token) {
      throw new Error('No API token');
    }

    console.log('Runnign finishBuild to /build');
    const put = bent(API_ENDPOINT, 'PUT', 'json', 200);

    return await put('/build', body, {
      'x-padding-token': token,
    });
  } catch (err) {
    console.log(
      "Running 'finishBuild', termination reason is:",
      body.results.terminationReason
    );
    const {owner, repo, galleryUrl, id, images, results, octokit} = body;
    const {
      baseFilesLength,
      changed,
      missing,
      added,
      terminationReason,
    } = results;
    const unchanged = baseFilesLength - (changed.length + missing.length);

    const totalChanged = changed.length + missing.length;
    const conclusion =
      totalChanged > 0
        ? 'action_required'
        : added.length
        ? 'neutral'
        : 'success';

    const title =
      totalChanged > 0
        ? `${totalChanged} snapshots need review`
        : added.length
        ? `${added.length} new snapshots`
        : 'No snapshot changes detected';

    console.log('Termination Reason', terminationReason, results);
    return await octokit.rest.checks.update({
      check_run_id: id,
      owner,
      repo,
      // details_url: galleryUrl,
      status: 'completed',
      conclusion,
      output: {
        title,
        summary: `
${galleryUrl ? `[View Image Gallery](${galleryUrl})` : ''}
* **${changed.length}** changed snapshots (${unchanged} unchanged)
* **${missing.length}** missing snapshots
* **${added.length}** new snapshots`,
        text: `
${
  terminationReason === 'maxChangedSnapshots'
    ? '## Max number of changed snapshots exceeded (snapshot run was terminated early)'
    : terminationReason
    ? `## This run was terminated early with termination reason: ${terminationReason}`
    : ''
}
${!changed.length && !missing.length && !added.length ? '## No changes' : ''}

${
  changed.length
    ? `## Changed snapshots
${[...changed].map(name => `* ${name}`).join('\n')}
`
    : ''
}

${
  missing.length
    ? `## Missing snapshots
${[...missing].map(name => `* ${name}`).join('\n')}
`
    : ''
}

${
  added.length
    ? `## New snapshots
${[...added].map(name => `* ${name}`).join('\n')}
`
    : ''
}`,
        images,
      },
    });
  }
}
