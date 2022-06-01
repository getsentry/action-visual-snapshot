import path from 'path';

import * as core from '@actions/core';
import * as glob from '@actions/glob';
import * as io from '@actions/io';
import * as Sentry from '@sentry/node';

import {PixelmatchOptions} from '@app/types';

import {createDiff} from './createDiff';
import {multiCompare} from './multiCompare';
import {getChildDirectories} from './getChildDirectories';

const pngGlob = '/**/*.png';

// Buckets n -  we use the tag buckets to tag runs in sentry
// and separate performance data by nb of diffs that were made.
function getDiffedTagBucket(n: number): string {
  const MAX_BUCKET = 2000;
  if (n >= MAX_BUCKET) {
    return `>=${MAX_BUCKET}`;
  }

  for (const bucket of [2, 5, 10, 25, 50, 100]) {
    if (n < bucket) {
      return `<${bucket}`;
    }
  }

  // Generate ranges of 100 increments for 100 - MAX_BUCKET
  return `<${Math.ceil(n / 100) * 100}`;
}

type DiffSnapshotsParams = {
  basePath: string;
  mergeBasePath: string;
  currentPath: string;
  outputPath: string;
  diffDirName?: string;
  baseDirName?: string;
  mergedDirName?: string;
  currentDirName?: string;
  newDirName?: string;
  missingDirName?: string;
  pixelmatchOptions?: PixelmatchOptions;
  maxChangedSnapshots?: number;
};

// Max number of changed snapshots - once this number is reached,
// the diff process will early terminate and the non-processed snapshots
// will be removed from the missingSnapshots sets.

// The magic number 30 comes from the fact that we have 24 email templates
// and the current workflow for making changes to them is to use the visual
// diffs to see if the changes reflected. 30 gives us a small buffer to deal with
const DEFAULT_MAX_CHANGED_SNAPSHOTS = 30;

/**
 * Given a list of files for
 * 1) base
 * 2) mergeBase
 * 3) current
 *
 * Compare and diff and return snapshot names that have:
 * - changed
 * - added
 * - missing
 */
export async function diffSnapshots({
  basePath,
  mergeBasePath,
  currentPath,
  outputPath,
  diffDirName = 'diffs',
  baseDirName = 'original',
  mergedDirName = 'merged',
  currentDirName = 'changed',
  newDirName = 'new',
  missingDirName = 'missing',
  pixelmatchOptions,
  maxChangedSnapshots = DEFAULT_MAX_CHANGED_SNAPSHOTS,
}: DiffSnapshotsParams) {
  let terminationReason: 'maxChangedSnapshots' | null = null;

  const transaction = Sentry.getCurrentHub().getScope()?.getTransaction();
  const span = transaction?.startChild({
    op: 'diff snapshots',
    description: 'diff snapshots',
  });

  const newSnapshots = new Set<string>([]);
  const changedSnapshots = new Set<string>([]);
  const missingSnapshots = new Set<string>([]);
  const currentSnapshots = new Set<string>([]);
  const baseSnapshots = new Set<string>([]);
  const potentialFlakes = new Set<string>([]);

  // globs
  const [baseGlobber, currentGlobber, mergeBaseGlobber] = await Promise.all([
    glob.create(`${basePath}${pngGlob}`, {followSymbolicLinks: false}),
    glob.create(`${currentPath}${pngGlob}`, {followSymbolicLinks: false}),
    glob.create(`${mergeBasePath}${pngGlob}`, {followSymbolicLinks: false}),
  ]);

  const [baseFiles, currentFiles, mergeBaseFiles] = await Promise.all([
    baseGlobber.glob(),
    currentGlobber.glob(),
    mergeBaseGlobber.glob(),
  ]);

  if (!baseFiles.length) {
    core.warning('No snapshots found for base branch');
  }

  if (!mergeBaseFiles.length) {
    core.debug('No snapshots found for merge base');
  }

  if (!currentFiles.length) {
    core.warning('No snapshots found for current branch');
  }

  baseFiles.forEach(absoluteFile => {
    const file = path.relative(basePath, absoluteFile);
    baseSnapshots.add(file);
    missingSnapshots.add(file);
  });

  // index merge base files as well
  const mergeBaseSnapshots = new Set(
    mergeBaseFiles.map(absolute => path.relative(mergeBasePath, absolute))
  );

  // Since we recurse in the directories looking for pngs, we need to replicate
  // directory structure in the diff directory
  const childPaths = getChildDirectories([
    [currentPath, currentFiles],
    [basePath, baseFiles],
  ]);

  // We need these as we'll move the images that were used to compare into corresponding dirs
  const outputDiffPath = path.resolve(outputPath, diffDirName);
  const outputBasePath = path.resolve(outputPath, baseDirName);
  const outputCurrentPath = path.resolve(outputPath, currentDirName);
  const outputMergedPath = path.resolve(outputPath, mergedDirName);
  const outputNewPath = path.resolve(outputPath, newDirName);
  const outputMissingPath = path.resolve(outputPath, missingDirName);

  for (const base of [
    outputDiffPath,
    outputBasePath,
    outputCurrentPath,
    outputMergedPath,
    outputNewPath,
    outputMissingPath,
  ]) {
    for (const childPath of [...childPaths]) {
      try {
        await io.mkdirP(path.resolve(base, childPath));
      } catch (err) {
        Sentry.captureException(new Error(err.message));
      }
    }
  }

  // Set a sentry tag so we can compare transaction performance on
  // runs that have a similar number of changed snapshots.
  transaction?.setTag(
    'snapshots.diffed.grouped',
    getDiffedTagBucket(currentFiles.length)
  );

  // Diff snapshots against base branch
  // This is to make sure we run the above tasks serially, otherwise we will
  // face OOM issues
  // Diff snapshots against base branch. This is to make sure we run the above tasks serially, otherwise we will face OOM issues
  const queue = [...currentFiles];
  while (queue.length > 0) {
    // If we have a lot of changed snapshots, there is probably a flake somewhere
    // and diffing + uploading all of the diffs will take a very long time. We are
    // likely not interested in all of them and subset will be enough.
    if (changedSnapshots.size >= maxChangedSnapshots) {
      terminationReason = 'maxChangedSnapshots';
      break;
    }

    const absoluteFile = queue.pop();
    if (absoluteFile === undefined) {
      // This should never happen, but *just in case*, we just skip the file
      continue;
    }

    // Since there is a chance that the loop terminates early, we need to keep this
    // "file" in sync with the loop that reprocesses the leftover items and removes
    // them from the missingSnapshots set on L210. File basically means "key" in this case
    const file = path.relative(currentPath, absoluteFile);
    currentSnapshots.add(file);

    if (baseSnapshots.has(file)) {
      const baseHead = path.resolve(basePath, file);
      const branchHead = path.resolve(currentPath, file);

      try {
        let isDiff;

        // If merge base snapshot exists, do a 3way diff
        if (mergeBaseSnapshots.has(file)) {
          isDiff = await multiCompare({
            branchBase: path.resolve(mergeBasePath, file),
            baseHead,
            branchHead,
            outputDiffPath,
            outputMergedPath,
            snapshotName: file,
            pixelmatchOptions,
          });
        } else {
          isDiff = await createDiff(
            file,
            outputDiffPath,
            baseHead,
            branchHead,
            pixelmatchOptions
          );
        }

        if (isDiff) {
          changedSnapshots.add(file);
          // Copy original + new files to results/output dirs
          await Promise.all([
            io.cp(baseHead, path.resolve(outputBasePath, file)),
            io.cp(branchHead, path.resolve(outputCurrentPath, file)),
          ]);
        }

        missingSnapshots.delete(file);
      } catch (err) {
        core.debug(`Unable to diff: ${err.message}`);
        throw err;
      }
    } else {
      newSnapshots.add(file);
    }
  }

  // Since there is a chance that the loop terminates early, we need to reprocess the rest of the
  // snapshots that we may have skipped. Instead of marking them as missing, which could be missleading,
  // we just remove them from the set.
  while (queue.length > 0) {
    const absoluteFile = queue.pop();
    if (absoluteFile === undefined) {
      // This should never happen, but *just in case*, we just skip the file
      continue;
    }
    const file = path.relative(currentPath, absoluteFile);
    missingSnapshots.delete(file);
  }

  // TODO: Track cases where snapshot exists in `mergeBaseSnapshots`, but not
  // in current and base
  missingSnapshots.forEach(file => {
    if (mergeBaseFiles.length && !mergeBaseSnapshots.has(file)) {
      // It's possible this isn't desirable, but seems likely that this snapshot was
      // added in latest base.
      missingSnapshots.delete(file);
      potentialFlakes.add(file);
      return;
    }
  });

  newSnapshots.forEach(file => {
    if (mergeBaseSnapshots.has(file)) {
      // It's possible this isn't desirable, but seems likely that this snapshot was
      // removed in latest base.
      newSnapshots.delete(file);
      potentialFlakes.add(file);
      return;
    }
  });

  await Promise.all(
    [...missingSnapshots].map(
      async file =>
        await io.cp(
          path.resolve(basePath, file),
          path.resolve(outputMissingPath, file)
        )
    )
  );

  await Promise.all(
    [...newSnapshots].map(
      async file =>
        await io.cp(
          path.resolve(currentPath, file),
          path.resolve(outputNewPath, file)
        )
    )
  );

  span?.finish();
  return {
    terminationReason,
    baseFiles,
    missingSnapshots,
    newSnapshots,
    changedSnapshots,
    potentialFlakes,
  };
}
