import {promises as fs} from 'fs';
import path from 'path';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';

import {findChangedPixels} from './findChangedPixels';
import {fileToPng} from './fileToPng';
import {copyPixel} from './copyPixel';
import {getDiff} from './getDiff';
import {getCombinedDiff} from './getCombinedDiff';

type Options = {
  output: string;
  snapshotName: string;
  branchBase: string;
  baseHead: string;
  branchHead: string;
};

export async function multiCompare({
  output,
  snapshotName,
  branchBase,
  baseHead,
  branchHead,
}: Options) {
  const [
    baseHeadImage,
    branchHeadImage,
    branchHeadMergedImage,
  ] = await Promise.all([
    fileToPng(baseHead),
    fileToPng(branchHead),
    fileToPng(branchHead),
  ]);

  // diff baseHeadImage and branchBaseImage -- alpha must be 0 so that we can
  // correctly identify the diffed pixels
  const {
    result: baseDiffResult,
    diff: branchBaseBaseHeadDiffImage,
  } = await getDiff(branchBase, baseHead, {
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
  }

  // await fs.writeFile(
  // path.resolve('./3waymerge.png'),
  // PNG.sync.write(branchHeadImage)
  // );

  // diff branch head snapshot against head snapshot
  const {width, height} = branchHeadMergedImage;
  const diff = new PNG({width, height});

  const result = pixelmatch(
    baseHeadImage.data,
    branchHeadMergedImage.data,
    diff.data,
    width,
    height,
    {
      includeAA: true,
      threshold: 0.2,
    }
  );

  if (result > 0) {
    // TODO detect conflicts

    const combined = await getCombinedDiff(
      baseHeadImage,
      branchHeadImage,
      diff
    );

    await Promise.all([
      fs.writeFile(
        path.resolve(output, snapshotName),
        PNG.sync.write(combined)
      ),
    ]);
  }

  return result;
}
