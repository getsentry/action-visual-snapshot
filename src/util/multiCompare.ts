import {promises as fs} from 'fs';
import path from 'path';
import {PNG} from 'pngjs';
import * as Sentry from '@sentry/node';

import {findChangedPixels} from './findChangedPixels';
import {fileToPng} from './fileToPng';
import {copyPixel} from './copyPixel';
import {getDiff} from './getDiff';

type Options = {
  snapshotName: string;
  branchBase: string;
  baseHead: string;
  branchHead: string;
  outputDiffPath: string;
  outputMergedPath: string;
};

export async function multiCompare({
  snapshotName,
  branchBase,
  baseHead,
  branchHead,
  outputDiffPath,
  outputMergedPath,
}: Options) {
  const promises = [];

  const [
    baseHeadImage,
    branchHeadMergedImage,
    branchBaseImage,
  ] = await Promise.all([
    fileToPng(baseHead),
    fileToPng(branchHead),
    fileToPng(branchBase),
  ]);

  try {
    // diff baseHeadImage and branchBaseImage -- alpha must be 0 so that we can
    // correctly identify the diffed pixels
    const {
      result: baseDiffResult,
      diff: branchBaseBaseHeadDiffImage,
    } = await getDiff(branchBaseImage, baseHeadImage, {
      alpha: 0,
    });

    if (baseDiffResult > 0) {
      // Find pixel locations that have changed from branch base ---> head
      const changedPixels = findChangedPixels(branchBaseBaseHeadDiffImage);

      // Apply pixel locations from head snapshot to branch head snapshot
      // `branchHeadMergedImage` is now merged between baseHead and branchHeadImage
      changedPixels.forEach(idx => {
        copyPixel(idx, baseHeadImage, branchHeadMergedImage);
      });

      // Output merged image to fs
      promises.push(
        fs.writeFile(
          path.resolve(outputMergedPath, snapshotName),
          PNG.sync.write(branchHeadMergedImage)
        )
      );
    }
  } catch (err) {
    // Can't 3-way compare
    Sentry.captureException(err);
  }

  const {result, diff} = await getDiff(baseHeadImage, branchHeadMergedImage);

  if (result > 0) {
    // TODO detect conflicts
    promises.push(
      fs.writeFile(
        path.resolve(outputDiffPath, snapshotName),
        PNG.sync.write(diff)
      )
    );
  }

  await Promise.all(promises);

  return result;
}
