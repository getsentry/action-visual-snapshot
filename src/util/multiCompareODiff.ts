import sharp from 'sharp';
import {readFileSync, unlinkSync} from 'fs';
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
      antialiasing: false,
      ...diffOptions,
    }
  );

  // Hot path for when baseHead and branchBase do not have any respective changes,
  // we can indue that there is nothing to merge and we can skip the 2nd image diff operation
  if (diffB === 0) {
    return 0;
  }

  const diffA = await getDiffODiff(
    baseHead,
    branchBase,
    outputMergedMaskPathA,
    {
      outputDiffMask: true,
      antialiasing: false,
      ...diffOptions,
    }
  );

  const maskA = readFileSync(outputMergedMaskPathA);
  const maskB = readFileSync(outputMergedMaskPathB);

  const finalMask = await sharp(maskA)
    .composite([{input: maskB, blend: 'xor'}])
    .toBuffer();

  unlinkSync(outputMergedMaskPathA);
  unlinkSync(outputMergedMaskPathB);

  const result = Math.abs(diffB - diffA);

  if (result > 0) {
    const final = sharp(readFileSync(baseHead)).composite([
      {input: finalMask, blend: 'over'},
    ]);

    await final.toFile(outputDiffPath);
  }

  return result;
}
