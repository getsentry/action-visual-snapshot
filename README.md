# action-visual-snapshot ![test](https://github.com/getsentry/action-visual-snapshot/workflows/test/badge.svg)

This is a GitHub action that compares 2-3 sets of images and produces a diff using [pixelmatch](https://github.com/mapbox/pixelmatch). The idea is to have your tests generate screenshots, save those screenshots as an artifact in GitHub, compare them to a "base" (e.g. main branch) set of images and produce a diff image of the changed pixels, and then upload those diffs as an artifact as well.

## Usage

There are two steps required in your GitHub workflow. First, upload your snapshots as GitHub Action artifact. `path` needs to reference the path where your snapshots are saved and `name` is the name of the artifact for GitHub.

```yml
  - name: Save snapshots
    if: always()
    uses: actions/upload-artifact@v2
    with:
      save-only: true
      path: .artifacts/visual-snapshots
```

Then you'll need to run the action to compare the snapshots (`gcs-bucket` and `gcp-service-account-key`
are optional and will upload your images to the bucket if specified):

```yml
    visual-diff:
      if: ${{ github.ref != 'refs/heads/master' }}
      needs: acceptance
      runs-on: ubuntu-16.04

      steps:
        - name: Diff snapshots
          id: visual-snapshots-diff
          uses: getsentry/action-visual-snapshot@v1
          with:
            githubToken: ${{ secrets.GITHUB_TOKEN }}
            gcs-bucket: 'sentry-visual-snapshots'
            gcp-service-account-key: ${{ secrets.SNAPSHOT_GOOGLE_SERVICE_ACCOUNT_KEY }}
```

## Contributing

WIP

### Updating Image Gallery Template

The main template is `src/template/index.ejs` -- this gets "built" into a module (that is
the actual template) that the action can use and inject data into.

```bash
yarn dev:gallery && open example_gallery/index.html
```

Files changes to `src/template/index.ejs` will rebuild the `example_gallery/index.html` file (although you currently
need to save the file twice).


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
