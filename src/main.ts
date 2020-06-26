/* eslint-env node */
import * as fsNs from "fs";
import path from "path";
import * as github from "@actions/github";
import * as core from "@actions/core";
import { exec } from "@actions/exec";
import { Storage } from "@google-cloud/storage";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";

const fs = fsNs.promises;
const { owner, repo } = github.context.repo;
const token = core.getInput("githubToken");
const octokit = github.getOctokit(token);
const GITHUB_SHA = process.env.GITHUB_SHA || "";
const GITHUB_WORKSPACE = process.env.GITHUB_WORKSPACE || "";
const GOOGLE_CREDENTIALS = process.env.GOOGLE_CREDENTIALS || "";

const credentials = JSON.parse(
  Buffer.from(GOOGLE_CREDENTIALS, "base64").toString("utf8")
);

// Creates a client
const storage = new Storage({ credentials });

function isSnapshot(dirent: fsNs.Dirent) {
  // Only png atm
  return dirent.isFile() && dirent.name.endsWith(".png");
}

async function createDiff(
  snapshotName: string,
  output: string,
  file1: string,
  file2: string
) {
  const [fileContent1, fileContent2] = await Promise.all([
    fs.readFile(file1),
    fs.readFile(file2)
  ]);

  const img1 = PNG.sync.read(fileContent1);
  const img2 = PNG.sync.read(fileContent2);
  const { width, height } = img1;
  const diff = new PNG({ width, height });

  const result = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1
  });

  if (result > 0) {
    await fs.writeFile(
      path.resolve(output, snapshotName),
      PNG.sync.write(diff)
    );
  }

  return result;
}

async function run(): Promise<void> {
  try {
    const current: string = core.getInput("snapshot-path");
    const diff: string = core.getInput("diff-path");
    core.debug(`${current} vs ${diff}`);

    core.debug(GITHUB_WORKSPACE);
    core.setOutput("diff-path", diff);

    const newSnapshots = new Set<string>([]);
    const changedSnapshots = new Set<string>([]);
    const missingSnapshots = new Map<string, fsNs.Dirent>([]);
    const currentSnapshots = new Map<string, fsNs.Dirent>([]);
    const baseSnapshots = new Map<string, fsNs.Dirent>([]);

    // fetch artifact from main branch
    // this is hacky since github actions do not support downloading
    // artifacts from different workflows
    const {
      data: {
        workflow_runs: [workflowRun]
      }
    } = await octokit.actions.listWorkflowRuns({
      owner,
      repo,
      // Below is typed incorrectly
      // @ts-ignore
      workflow_id: core.getInput("base-workflow-id"),
      branch: core.getInput("base-branch")
    });

    if (!workflowRun) {
      core.debug("No base workflow run found");
    }

    const {
      data: { artifacts }
    } = await octokit.actions.listWorkflowRunArtifacts({
      owner,
      repo,
      run_id: workflowRun.id
    });

    core.debug(JSON.stringify(artifacts));
    // filter artifacts for `visual-snapshots-main`
    const mainSnapshotArtifact = artifacts.find(
      artifact => artifact.name === core.getInput("base-artifact-name")
    );

    if (!mainSnapshotArtifact) {
      core.debug("Artifact not found");
      return;
    }

    // Download the artifact
    const download = await octokit.actions.downloadArtifact({
      owner,
      repo,
      artifact_id: mainSnapshotArtifact.id,
      archive_format: "zip"
    });

    core.debug(JSON.stringify(download));

    const outputPath = path.resolve("/tmp/visual-snapshots-base");
    try {
      await fs.mkdir(outputPath, { recursive: true });
    } catch {
      core.debug(`Unable to create dir: ${outputPath}`);
    }

    await exec(
      `curl -L -o ${path.resolve(outputPath, "visual-snapshots-base.zip")} ${
        download.url
      }`
    );
    await exec(
      `unzip -d ${outputPath} ${path.resolve(
        outputPath,
        "visual-snapshots-base.zip"
      )}`
    );

    // read dirs
    const [currentDir, baseDir] = await Promise.all([
      fs.readdir(current, { withFileTypes: true }),
      fs.readdir(path.resolve(outputPath), {
        withFileTypes: true
      })
    ]);

    // make output dir if not exists
    const diffPath = path.resolve(GITHUB_WORKSPACE, diff);

    try {
      await fs.mkdir(diffPath, { recursive: true });
    } catch {
      core.debug(`Unable to create dir: ${diffPath}`);
    }

    baseDir.filter(isSnapshot).forEach(entry => {
      baseSnapshots.set(entry.name, entry);
      missingSnapshots.set(entry.name, entry);
    });

    await Promise.all(
      currentDir.filter(isSnapshot).map(async entry => {
        currentSnapshots.set(entry.name, entry);

        if (baseSnapshots.has(entry.name)) {
          try {
            const isDiff = await createDiff(
              entry.name,
              path.resolve(GITHUB_WORKSPACE, diff),
              path.resolve(GITHUB_WORKSPACE, current, entry.name),
              path.resolve(outputPath, entry.name)
            );
            if (isDiff) {
              changedSnapshots.add(entry.name);
            }
            missingSnapshots.delete(entry.name);
          } catch (err) {
            core.debug(`Unable to diff: ${err.message}`);
          }
        } else {
          newSnapshots.add(entry.name);
        }
      })
    );

    missingSnapshots.forEach(entry => {
      core.debug(`missing snapshot: ${entry.name}`);
    });

    newSnapshots.forEach(entryName => {
      core.debug(`new snapshot: ${entryName}`);
    });

    changedSnapshots.forEach(name => {
      core.debug(`changed snapshot: ${name}`);
    });

    // TODO: Upload diff files where and update check with them
    const diffFiles =
      (await fs.readdir(diffPath, {
        withFileTypes: true
      })) || [];

    const diffArtifactUrls = await Promise.all(
      diffFiles.filter(isSnapshot).map(async entry => {
        const [File] = await storage
          .bucket("sentry-visual-snapshots")
          .upload(path.resolve(diffPath, entry.name), {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            destination: `${owner}/${repo}/${GITHUB_SHA}/diff/${entry.name}`,
            // public: true,
            gzip: true,
            // By setting the option `destination`, you can change the name of the
            // object you are uploading to a bucket.
            metadata: {
              // Enable long-lived HTTP caching headers
              // Use only if the contents of the file will never change
              // (If the contents will change, use cacheControl: 'no-cache')
              cacheControl: "public, max-age=31536000"
            }
          });
        console.log(path.resolve(diffPath, entry.name), File);

        return {
          alt: entry.name,
          image_url: `https://storage.googleapis.com/sentry-visual-snapshots/${File.name}`
        };
      })
    );

    console.log(diffArtifactUrls);
    const conclusion =
      !!changedSnapshots.size || !!missingSnapshots.size
        ? "failure"
        : !!newSnapshots.size
        ? "neutral"
        : "success";

    // Create a GitHub check with our results
    await octokit.checks.create({
      owner,
      repo,
      name: "Visual Snapshot",
      head_sha: GITHUB_SHA,
      status: "completed",
      conclusion,
      output: {
        title: "Visual Snapshots",
        summary: `Summary:
* **${changedSnapshots.size}** changed snapshots
* **${missingSnapshots.size}** missing snapshots
* **${newSnapshots.size}** new snapshots
`,
        text: `
## Changed snapshots
${[...changedSnapshots].map(name => `* ${name}`).join("\n")}

## Missing snapshots
${[...missingSnapshots].map(([name]) => `* ${name}`).join("\n")}

## New snapshots
${[...newSnapshots].map(name => `* ${name}`).join("\n")}
`,
        images: diffArtifactUrls
      }
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
