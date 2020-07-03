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
  const [baseHeadImage, branchHeadImage] = await Promise.all([
    fileToPng(baseHead),
    fileToPng(branchHead),
  ]);

  // diff baseHeadImage and branchBaseImage -- alpha must be 0 so that we can
  // correctly identify the diffed pixels
  const {diff: branchBaseBaseHeadDiffImage} = await getDiff(
    branchBase,
    baseHead,
    {
      alpha: 0,
    }
  );

  // Find pixel locations that have changed from branch base ---> head
  const changedPixels = findChangedPixels(branchBaseBaseHeadDiffImage);

  // Apply pixel locations from head snapshot to branch head snapshot
  changedPixels.forEach(idx => {
    copyPixel(idx, baseHeadImage, branchHeadImage);
  });

  // `branchHeadImage` is now merged between baseHead and branchHeadImage

  // await fs.writeFile(
  // path.resolve('./3waymerge.png'),
  // PNG.sync.write(branchHeadImage)
  // );

  // diff branch head snapshot against head snapshot
  const {width, height} = branchHeadImage;
  const diff = new PNG({width, height});

  const result = pixelmatch(
    baseHeadImage.data,
    branchHeadImage.data,
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

    await fs.writeFile(
      path.resolve(output, snapshotName),
      PNG.sync.write(combined)
    );
  }

  return result;
}
