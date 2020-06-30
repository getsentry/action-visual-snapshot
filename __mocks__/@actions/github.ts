export const getOctokit = jest.fn((token: string) => {
  return {
    actions: {
      downloadArtifact: jest.fn(() =>
        Promise.resolve({
          status: 200,
          url:
            'https://pipelines.actions.githubusercontent.com/fVNRiR9dLg3DkWCpAUCEq7qRezdKTcYtICIqwx0vWs6L0oyqxQ/_apis/pipelines/1/runs/487/signedartifactscontent?artifactName=visual-snapshots&urlExpires=2020-06-30T00%3A19%3A19.8133132Z&urlSigningMethod=HMACV1&urlSignature=12tWt93zqyKS9Fy7IMRj1NGHxGn07YTDwOZT988hCAI%3D',
          headers: {
            activityid: '6f102bff-9bb1-417c-b287-11fe2590b59f',
            'cache-control': 'no-store,no-cache',
            connection: 'close',
            'content-disposition':
              "attachment; filename=visual-snapshots.zip; filename*=UTF-8''visual-snapshots.zip",
            'content-type': 'application/zip',
            date: 'Tue, 30 Jun 2020 00:18:19 GMT',
            pragma: 'no-cache',
            'strict-transport-security': 'max-age=2592000',
            'transfer-encoding': 'chunked',
            'x-msedge-ref':
              'Ref A: E43B909F46624B43B8BF124E065BA79F Ref B: BL2EDGE1012 Ref C: 2020-06-30T00:18:19Z',
            'x-tfs-processid': 'c89a355b-8563-4622-8185-9522d07edc84',
            'x-tfs-session': '6f102bff-9bb1-417c-b287-11fe2590b59f',
            'x-vss-e2eid': '6f102bff-9bb1-417c-b287-11fe2590b59f',
            'x-vss-senderdeploymentid': '193695a0-0dcd-ade4-f810-b10ad24a9829',
          },
          data: {},
        })
      ),
      listWorkflowRuns: jest.fn(() =>
        Promise.resolve({
          data: {
            workflow_runs: [
              {
                id: 152081708,
                node_id: 'MDExOldvcmtmbG93UnVuMTUyMDgxNzA4',
                head_branch: 'master',
                head_sha: '5e19cbbea129a173dc79d4634df0fdaece933b06',
                run_number: 172,
                event: 'push',
                status: 'completed',
                conclusion: 'success',
                workflow_id: 1154499,
                url:
                  'https://api.github.com/repos/billyvg/sentry/actions/runs/152081708',
                html_url:
                  'https://github.com/billyvg/sentry/actions/runs/152081708',
                pull_requests: [],
                created_at: '2020-06-29T23:42:39Z',
                updated_at: '2020-06-29T23:56:40Z',
                jobs_url:
                  'https://api.github.com/repos/billyvg/sentry/actions/runs/152081708/jobs',
                logs_url:
                  'https://api.github.com/repos/billyvg/sentry/actions/runs/152081708/logs',
                check_suite_url:
                  'https://api.github.com/repos/billyvg/sentry/check-suites/856201749',
                artifacts_url:
                  'https://api.github.com/repos/billyvg/sentry/actions/runs/152081708/artifacts',
                cancel_url:
                  'https://api.github.com/repos/billyvg/sentry/actions/runs/152081708/cancel',
                rerun_url:
                  'https://api.github.com/repos/billyvg/sentry/actions/runs/152081708/rerun',
                workflow_url:
                  'https://api.github.com/repos/billyvg/sentry/actions/workflows/1154499',
                head_commit: {
                  id: '5e19cbbea129a173dc79d4634df0fdaece933b06',
                  tree_id: '332a699162888947ea062892169d9d81a9c906fe',
                  message: 'remove wait for animations',
                  timestamp: '2020-06-29T23:42:25Z',
                  author: {name: 'Billy Vong', email: 'billy@sentry.io'},
                  committer: {name: 'Billy Vong', email: 'billy@sentry.io'},
                },
                repository: {
                  id: 95487005,
                  node_id: 'MDEwOlJlcG9zaXRvcnk5NTQ4NzAwNQ==',
                  name: 'sentry',
                  full_name: 'billyvg/sentry',
                  private: false,
                  owner: {
                    login: 'billyvg',
                    id: 79684,
                    node_id: 'MDQ6VXNlcjc5Njg0',
                    avatar_url:
                      'https://avatars3.githubusercontent.com/u/79684?v=4',
                    gravatar_id: '',
                    url: 'https://api.github.com/users/billyvg',
                    html_url: 'https://github.com/billyvg',
                    followers_url:
                      'https://api.github.com/users/billyvg/followers',
                    following_url:
                      'https://api.github.com/users/billyvg/following{/other_user}',
                    gists_url:
                      'https://api.github.com/users/billyvg/gists{/gist_id}',
                    starred_url:
                      'https://api.github.com/users/billyvg/starred{/owner}{/repo}',
                    subscriptions_url:
                      'https://api.github.com/users/billyvg/subscriptions',
                    organizations_url:
                      'https://api.github.com/users/billyvg/orgs',
                    repos_url: 'https://api.github.com/users/billyvg/repos',
                    events_url:
                      'https://api.github.com/users/billyvg/events{/privacy}',
                    received_events_url:
                      'https://api.github.com/users/billyvg/received_events',
                    type: 'User',
                    site_admin: false,
                  },
                  html_url: 'https://github.com/billyvg/sentry',
                  description:
                    'Sentry is a cross-platform crash reporting and aggregation platform.',
                  fork: true,
                  url: 'https://api.github.com/repos/billyvg/sentry',
                  forks_url:
                    'https://api.github.com/repos/billyvg/sentry/forks',
                  keys_url:
                    'https://api.github.com/repos/billyvg/sentry/keys{/key_id}',
                  collaborators_url:
                    'https://api.github.com/repos/billyvg/sentry/collaborators{/collaborator}',
                  teams_url:
                    'https://api.github.com/repos/billyvg/sentry/teams',
                  hooks_url:
                    'https://api.github.com/repos/billyvg/sentry/hooks',
                  issue_events_url:
                    'https://api.github.com/repos/billyvg/sentry/issues/events{/number}',
                  events_url:
                    'https://api.github.com/repos/billyvg/sentry/events',
                  assignees_url:
                    'https://api.github.com/repos/billyvg/sentry/assignees{/user}',
                  branches_url:
                    'https://api.github.com/repos/billyvg/sentry/branches{/branch}',
                  tags_url: 'https://api.github.com/repos/billyvg/sentry/tags',
                  blobs_url:
                    'https://api.github.com/repos/billyvg/sentry/git/blobs{/sha}',
                  git_tags_url:
                    'https://api.github.com/repos/billyvg/sentry/git/tags{/sha}',
                  git_refs_url:
                    'https://api.github.com/repos/billyvg/sentry/git/refs{/sha}',
                  trees_url:
                    'https://api.github.com/repos/billyvg/sentry/git/trees{/sha}',
                  statuses_url:
                    'https://api.github.com/repos/billyvg/sentry/statuses/{sha}',
                  languages_url:
                    'https://api.github.com/repos/billyvg/sentry/languages',
                  stargazers_url:
                    'https://api.github.com/repos/billyvg/sentry/stargazers',
                  contributors_url:
                    'https://api.github.com/repos/billyvg/sentry/contributors',
                  subscribers_url:
                    'https://api.github.com/repos/billyvg/sentry/subscribers',
                  subscription_url:
                    'https://api.github.com/repos/billyvg/sentry/subscription',
                  commits_url:
                    'https://api.github.com/repos/billyvg/sentry/commits{/sha}',
                  git_commits_url:
                    'https://api.github.com/repos/billyvg/sentry/git/commits{/sha}',
                  comments_url:
                    'https://api.github.com/repos/billyvg/sentry/comments{/number}',
                  issue_comment_url:
                    'https://api.github.com/repos/billyvg/sentry/issues/comments{/number}',
                  contents_url:
                    'https://api.github.com/repos/billyvg/sentry/contents/{+path}',
                  compare_url:
                    'https://api.github.com/repos/billyvg/sentry/compare/{base}...{head}',
                  merges_url:
                    'https://api.github.com/repos/billyvg/sentry/merges',
                  archive_url:
                    'https://api.github.com/repos/billyvg/sentry/{archive_format}{/ref}',
                  downloads_url:
                    'https://api.github.com/repos/billyvg/sentry/downloads',
                  issues_url:
                    'https://api.github.com/repos/billyvg/sentry/issues{/number}',
                  pulls_url:
                    'https://api.github.com/repos/billyvg/sentry/pulls{/number}',
                  milestones_url:
                    'https://api.github.com/repos/billyvg/sentry/milestones{/number}',
                  notifications_url:
                    'https://api.github.com/repos/billyvg/sentry/notifications{?since,all,participating}',
                  labels_url:
                    'https://api.github.com/repos/billyvg/sentry/labels{/name}',
                  releases_url:
                    'https://api.github.com/repos/billyvg/sentry/releases{/id}',
                  deployments_url:
                    'https://api.github.com/repos/billyvg/sentry/deployments',
                },
                head_repository: {
                  id: 95487005,
                  node_id: 'MDEwOlJlcG9zaXRvcnk5NTQ4NzAwNQ==',
                  name: 'sentry',
                  full_name: 'billyvg/sentry',
                  private: false,
                  owner: {
                    login: 'billyvg',
                    id: 79684,
                    node_id: 'MDQ6VXNlcjc5Njg0',
                    avatar_url:
                      'https://avatars3.githubusercontent.com/u/79684?v=4',
                    gravatar_id: '',
                    url: 'https://api.github.com/users/billyvg',
                    html_url: 'https://github.com/billyvg',
                    followers_url:
                      'https://api.github.com/users/billyvg/followers',
                    following_url:
                      'https://api.github.com/users/billyvg/following{/other_user}',
                    gists_url:
                      'https://api.github.com/users/billyvg/gists{/gist_id}',
                    starred_url:
                      'https://api.github.com/users/billyvg/starred{/owner}{/repo}',
                    subscriptions_url:
                      'https://api.github.com/users/billyvg/subscriptions',
                    organizations_url:
                      'https://api.github.com/users/billyvg/orgs',
                    repos_url: 'https://api.github.com/users/billyvg/repos',
                    events_url:
                      'https://api.github.com/users/billyvg/events{/privacy}',
                    received_events_url:
                      'https://api.github.com/users/billyvg/received_events',
                    type: 'User',
                    site_admin: false,
                  },
                  html_url: 'https://github.com/billyvg/sentry',
                  description:
                    'Sentry is a cross-platform crash reporting and aggregation platform.',
                  fork: true,
                  url: 'https://api.github.com/repos/billyvg/sentry',
                  forks_url:
                    'https://api.github.com/repos/billyvg/sentry/forks',
                  keys_url:
                    'https://api.github.com/repos/billyvg/sentry/keys{/key_id}',
                  collaborators_url:
                    'https://api.github.com/repos/billyvg/sentry/collaborators{/collaborator}',
                  teams_url:
                    'https://api.github.com/repos/billyvg/sentry/teams',
                  hooks_url:
                    'https://api.github.com/repos/billyvg/sentry/hooks',
                  issue_events_url:
                    'https://api.github.com/repos/billyvg/sentry/issues/events{/number}',
                  events_url:
                    'https://api.github.com/repos/billyvg/sentry/events',
                  assignees_url:
                    'https://api.github.com/repos/billyvg/sentry/assignees{/user}',
                  branches_url:
                    'https://api.github.com/repos/billyvg/sentry/branches{/branch}',
                  tags_url: 'https://api.github.com/repos/billyvg/sentry/tags',
                  blobs_url:
                    'https://api.github.com/repos/billyvg/sentry/git/blobs{/sha}',
                  git_tags_url:
                    'https://api.github.com/repos/billyvg/sentry/git/tags{/sha}',
                  git_refs_url:
                    'https://api.github.com/repos/billyvg/sentry/git/refs{/sha}',
                  trees_url:
                    'https://api.github.com/repos/billyvg/sentry/git/trees{/sha}',
                  statuses_url:
                    'https://api.github.com/repos/billyvg/sentry/statuses/{sha}',
                  languages_url:
                    'https://api.github.com/repos/billyvg/sentry/languages',
                  stargazers_url:
                    'https://api.github.com/repos/billyvg/sentry/stargazers',
                  contributors_url:
                    'https://api.github.com/repos/billyvg/sentry/contributors',
                  subscribers_url:
                    'https://api.github.com/repos/billyvg/sentry/subscribers',
                  subscription_url:
                    'https://api.github.com/repos/billyvg/sentry/subscription',
                  commits_url:
                    'https://api.github.com/repos/billyvg/sentry/commits{/sha}',
                  git_commits_url:
                    'https://api.github.com/repos/billyvg/sentry/git/commits{/sha}',
                  comments_url:
                    'https://api.github.com/repos/billyvg/sentry/comments{/number}',
                  issue_comment_url:
                    'https://api.github.com/repos/billyvg/sentry/issues/comments{/number}',
                  contents_url:
                    'https://api.github.com/repos/billyvg/sentry/contents/{+path}',
                  compare_url:
                    'https://api.github.com/repos/billyvg/sentry/compare/{base}...{head}',
                  merges_url:
                    'https://api.github.com/repos/billyvg/sentry/merges',
                  archive_url:
                    'https://api.github.com/repos/billyvg/sentry/{archive_format}{/ref}',
                  downloads_url:
                    'https://api.github.com/repos/billyvg/sentry/downloads',
                  issues_url:
                    'https://api.github.com/repos/billyvg/sentry/issues{/number}',
                  pulls_url:
                    'https://api.github.com/repos/billyvg/sentry/pulls{/number}',
                  notifications_url:
                    'https://api.github.com/repos/billyvg/sentry/notifications{?since,all,participating}',
                  labels_url:
                    'https://api.github.com/repos/billyvg/sentry/labels{/name}',
                  releases_url:
                    'https://api.github.com/repos/billyvg/sentry/releases{/id}',
                  deployments_url:
                    'https://api.github.com/repos/billyvg/sentry/deployments',
                },
              },
            ],
          },
        })
      ),
      listWorkflowRunArtifacts: jest.fn(() =>
        Promise.resolve({
          data: {
            artifacts: [
              {
                id: 9808919,
                node_id: 'MDg6QXJ0aWZhY3Q5ODA4OTE5',
                name: 'visual-snapshots',
                size_in_bytes: 11768446,
                url:
                  'https://api.github.com/repos/billyvg/sentry/actions/artifacts/9808919',
                archive_download_url:
                  'https://api.github.com/repos/billyvg/sentry/actions/artifacts/9808919/zip',
                expired: false,
                created_at: '2020-06-29T23:56:36Z',
                updated_at: '2020-06-29T23:56:40Z',
              },
            ],
          },
        })
      ),
    },
  };
});
