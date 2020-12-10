const listWorkflowRunsMock = jest.fn(async () =>
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
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708',
          html_url:
            'https://github.com/getsentry/sentry/actions/runs/152081708',
          pull_requests: [],
          created_at: '2020-06-29T23:42:39Z',
          updated_at: '2020-06-29T23:56:40Z',
          jobs_url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708/jobs',
          logs_url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708/logs',
          check_suite_url:
            'https://api.github.com/repos/getsentry/sentry/check-suites/856201749',
          artifacts_url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708/artifacts',
          cancel_url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708/cancel',
          rerun_url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708/rerun',
          workflow_url:
            'https://api.github.com/repos/getsentry/sentry/actions/workflows/1154499',
          head_commit: {
            id: '5e19cbbea129a173dc79d4634df0fdaece933b06',
            tree_id: '332a699162888947ea062892169d9d81a9c906fe',
            message: 'remove wait for animations',
            timestamp: '2020-06-29T23:42:25Z',
            author: {name: 'Billy Vong', email: 'billy@sentry.io'},
            committer: {name: 'Billy Vong', email: 'billy@sentry.io'},
          },
          repository: {},
          head_repository: {
            full_name: 'getsentry/sentry',
          },
        },
        {
          id: 152081707,
          node_id: 'MDExOldvcmtmbG93UnVuMTUyMDgxNzA4',
          head_branch: 'master',
          head_sha: '11111111l129a173dc79d4634df0fdaece933b06',
          run_number: 171,
          event: 'push',
          status: 'completed',
          conclusion: 'success',
          workflow_id: 1154498,
          url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708',
          html_url:
            'https://github.com/getsentry/sentry/actions/runs/152081708',
          pull_requests: [],
          created_at: '2020-06-29T23:42:39Z',
          updated_at: '2020-06-29T23:56:40Z',
          jobs_url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708/jobs',
          logs_url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708/logs',
          check_suite_url:
            'https://api.github.com/repos/getsentry/sentry/check-suites/856201749',
          artifacts_url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708/artifacts',
          cancel_url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708/cancel',
          rerun_url:
            'https://api.github.com/repos/getsentry/sentry/actions/runs/152081708/rerun',
          workflow_url:
            'https://api.github.com/repos/getsentry/sentry/actions/workflows/1154499',
          repository: {},
          head_repository: {
            full_name: 'getsentry/sentry',
          },
        },
      ],
    },
  })
);
export const getOctokit = jest.fn(() => ({
  paginate: {
    // @ts-ignore
    iterator: function (fn, args) {
      return {
        async *[Symbol.asyncIterator]() {
          if (fn === listWorkflowRunsMock) {
            // @ts-ignore
            const resp = await listWorkflowRunsMock(args);

            yield {
              data: resp.data.workflow_runs,
              total_count: resp.data.workflow_runs.length,
            };
          }

          // not implemented
          yield null;
        },
      };
    },
  },

  actions: {
    downloadArtifact: jest.fn(async () =>
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
    listWorkflowRuns: listWorkflowRunsMock,
    listWorkflowRunArtifacts: jest.fn(async opts => {
      if (opts.run_id === 152081707) {
        return Promise.resolve({
          data: {
            artifacts: [
              {
                id: 8808920,
                node_id: '',
                name: 'visual-snapshots',
                size_in_bytes: 11768445,
                url:
                  'https://api.github.com/repos/getsentry/sentry/actions/artifacts/9808919',
                archive_download_url:
                  'https://api.github.com/repos/getsentry/sentry/actions/artifacts/9808919/zip',
                expired: false,
                created_at: '2020-06-29T23:56:36Z',
                updated_at: '2020-06-29T23:56:40Z',
              },
            ],
          },
        });
      }

      return Promise.resolve({
        data: {
          artifacts: [
            {
              id: 9808920,
              node_id: 'MDg6QXJ0aWZhY3Q5ODA4OTE5',
              name: 'not-visual-snapshots',
              size_in_bytes: 11768446,
              url:
                'https://api.github.com/repos/getsentry/sentry/actions/artifacts/9808919',
              archive_download_url:
                'https://api.github.com/repos/getsentry/sentry/actions/artifacts/9808919/zip',
              expired: false,
              created_at: '2020-06-29T23:56:36Z',
              updated_at: '2020-06-29T23:56:40Z',
            },
            {
              id: 9808919,
              node_id: 'MDg6QXJ0aWZhY3Q5ODA4OTE5',
              name: 'visual-snapshots',
              size_in_bytes: 11768446,
              url:
                'https://api.github.com/repos/getsentry/sentry/actions/artifacts/9808919',
              archive_download_url:
                'https://api.github.com/repos/getsentry/sentry/actions/artifacts/9808919/zip',
              expired: false,
              created_at: '2020-06-29T23:56:36Z',
              updated_at: '2020-06-29T23:56:40Z',
            },
          ],
        },
      });
    }),
  },
}));
