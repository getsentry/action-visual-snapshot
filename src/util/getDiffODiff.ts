import path from 'path';
import sharp from 'sharp';
import {existsSync, readFileSync, unlinkSync} from 'fs';
import {compare, ODiffOptions} from 'odiff-bin';

import {OVERLAY_COMPOSITE} from './multiCompareODiff';

const tmpMaskPath = '/tmp/mask.tmp.png';

type Required<T> = {[K in keyof T]-?: T[K]};

export async function getDiffODiff(
  file1: string,
  file2: string,
  diffPath: string,
  options: ODiffOptions = {}
): Promise<number> {
  if (!existsSync(file1)) {
    throw new Error('File does not exist: ' + file1);
  }
  if (!existsSync(file2)) {
    throw new Error('File does not exist: ' + file1);
  }

  const __binaryPath =
    process.env.NODE_ENV === 'test'
      ? undefined
      : path.resolve(__dirname, './odiff');

  const OPTIONS: Required<ODiffOptions> = {
    antialiasing: false,
    failOnLayoutDiff: false,
    outputDiffMask: false,
    threshold: 0.1,
    ...options,
    // @ts-ignore
    __binaryPath,
  };

  // If a user explicitly asks for the diffmask, then we output it.
  if (options.outputDiffMask) {
    const diff = await compare(file1, file2, diffPath, OPTIONS);

    // odiff will return match false even when match.diffPercentage is < threshold
    if (
      diff.match ||
      ('diffPercentage' in diff && diff.diffPercentage <= OPTIONS.threshold)
    ) {
      unlinkSync(diffPath);
      return 0;
    }
    if ('diffCount' in diff) {
      return diff.diffCount;
    }
    return 0;
  }

  // If the user asks for a diff, then we first output the diffmask.
  // and overlay it on top of the base image with opacity so that
  // diffs are easier to see.
  const diff = await compare(file1, file2, tmpMaskPath, {
    ...OPTIONS,
    outputDiffMask: true,
  });

  // odiff will return match false even when match.diffPercentage is < threshold
  if (
    diff.match ||
    ('diffPercentage' in diff && diff.diffPercentage <= OPTIONS.threshold)
  ) {
    unlinkSync(tmpMaskPath);
    return 0;
  }

  const withAlpha = await sharp(readFileSync(file1))
    .composite(OVERLAY_COMPOSITE)
    .toBuffer();

  await sharp(withAlpha)
    .composite([{input: tmpMaskPath, blend: 'over'}])
    .toFile(diffPath);

  unlinkSync(tmpMaskPath);

  if ('diffCount' in diff) {
    return diff.diffCount;
  }

  return 0;
}
