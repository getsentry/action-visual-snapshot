import sharp from 'sharp';
import {readFileSync, unlinkSync, existsSync} from 'fs';
import path from 'path';

import {getDiffODiff} from './getDiffODiff';
import {ODiffOptions} from 'odiff-bin';

type Options = {
  branchBase: string;
  baseHead: string;
  branchHead: string;
  outputDiffPath: string;
  outputMergedPath: string;
  diffOptions?: ODiffOptions;
};

export const OVERLAY_OPACITY = 0.8;
export const OVERLAY_COMPOSITE: sharp.OverlayOptions[] = [
  {
    input: Buffer.from([255, 255, 255, Math.round(255 * OVERLAY_OPACITY)]),
    raw: {
      width: 1,
      height: 1,
      channels: 4,
    },
    blend: 'over',
    tile: true,
  },
];

export async function multiCompareODiff({
  baseHead,
  branchBase,
  branchHead,
  outputDiffPath,
  outputMergedPath,
  diffOptions = {},
}: Options): Promise<number> {
  const fileBaseName = path.basename(outputDiffPath);
  const outputMergedMaskPathA = path.resolve(
    outputMergedPath,
    fileBaseName.replace('.png', '.a.png')
  );
  const outputMergedMaskPathB = path.resolve(
    outputMergedPath,
    fileBaseName.replace('.png', '.b.png')
  );

  const diffB = await getDiffODiff(
    baseHead,
    branchHead,
    outputMergedMaskPathB,
    {
      outputDiffMask: true,
      antialiasing: true,
      ...diffOptions,
    }
  );

  // Hot path for when baseHead and branchBase do not have any respective changes,
  // we can indue that there is nothing to merge and we can skip the 2nd image diff operation
  if (diffB === 0) {
    if (existsSync(outputMergedMaskPathB)) {
      unlinkSync(outputMergedMaskPathB);
    }
    return 0;
  }

  // If branchbase does not exist, but a mask was generated
  if (!existsSync(branchBase)) {
    if (existsSync(outputMergedMaskPathB)) {
      const withAlpha = await sharp(readFileSync(baseHead))
        .composite(OVERLAY_COMPOSITE)
        .toBuffer();

      await sharp(withAlpha)
        .composite([{input: outputMergedMaskPathB, blend: 'over'}])
        .toFile(outputMergedPath);
    }

    return diffB;
  }

  const diffA = await getDiffODiff(
    baseHead,
    branchBase,
    outputMergedMaskPathA,
    {
      outputDiffMask: true,
      antialiasing: true,
      ...diffOptions,
    }
  );

  if (existsSync(outputMergedMaskPathA) && existsSync(outputMergedMaskPathB)) {
    const maskA = readFileSync(outputMergedMaskPathA);
    const maskB = readFileSync(outputMergedMaskPathB);

    const finalMask = await sharp(maskA)
      .composite([{input: maskB, blend: 'xor'}])
      .toBuffer();

    unlinkSync(outputMergedMaskPathA);
    unlinkSync(outputMergedMaskPathB);

    const result = Math.abs(diffB - diffA);

    if (result > 0) {
      const withAlpha = await sharp(readFileSync(baseHead))
        .composite(OVERLAY_COMPOSITE)
        .toBuffer();

      await sharp(withAlpha)
        .composite([{input: finalMask, blend: 'over'}])
        .toFile(outputDiffPath);
    }

    return result;
  }

  return Math.abs(diffB - diffA);
}
