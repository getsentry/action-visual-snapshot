# action-visual-snapshot ![test](https://github.com/getsentry/action-visual-snapshot/workflows/test/badge.svg)
WIP

## Usage

There are two steps required in your GitHub workflow. First, upload your snapshots as GitHub Action artifact. `path` needs to reference the path where your snapshots are saved and `name` is the name of the artifact for GitHub.

```yml
  - name: Save snapshots
    if: always()
    uses: actions/upload-artifact@v2
    with:
      name: visual-snapshots
      path: .artifacts/visual-snapshots
```

Then you'll need to run the action to compare the snapshots:

```yml
    visual-diff:
      if: ${{ github.ref != 'refs/heads/master' }}
      needs: acceptance
      runs-on: ubuntu-16.04

      steps:
        - name: Download base snapshots
          uses: actions/download-artifact@v2
          with:
            name: visual-snapshots
            path: .artifacts/visual-snapshots

        - name: Diff snapshots
          id: visual-snapshots-diff
          uses: getsentry/action-visual-snapshot@v1
          with:
            githubToken: ${{ secrets.GITHUB_TOKEN }}
            snapshot-path: .artifacts/visual-snapshots
            gcs-bucket: 'sentry-visual-snapshots'
            gcp-service-account-key: ${{ secrets.SNAPSHOT_GOOGLE_SERVICE_ACCOUNT_KEY }}

        - name: Save diffed snapshots
          uses: actions/upload-artifact@v2
          with:
            name: visual-snapshots-diff
            path: ${{ steps.visual-snapshots-diff.outputs.diff-path }}
```

(Note this will be simplified soon)

## Contributing

WIP

### Publishing
Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ yarn dist
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)
