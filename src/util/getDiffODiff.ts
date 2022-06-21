import path from 'path';
import sharp from 'sharp';
import {existsSync, readFileSync, unlinkSync} from 'fs';
import {compare, ODiffOptions} from 'odiff-bin';

import {OVERLAY_COMPOSITE} from './multiCompareODiff';

type Awaited<T> = T extends PromiseLike<infer U>
  ? {0: Awaited<U>; 1: U}[U extends PromiseLike<any> ? 0 : 1]
  : T;
const tmpMaskPath = '/tmp/mask.tmp.png';

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

  const OPTIONS: ODiffOptions = {
    antialiasing: false,
    failOnLayoutDiff: false,
    outputDiffMask: false,
    threshold: 0.1,
    ...options,
    // @ts-ignorew
    __binaryPath,
  };

  // If a user explicitly asks for the diffmask, then we output it.
  if (options.outputDiffMask) {
    const diff = await compare(file1, file2, diffPath, OPTIONS);
    if (diff.match) {
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

  const withAlpha = await sharp(readFileSync(file1))
    .composite(OVERLAY_COMPOSITE)
    .toBuffer();

  await sharp(withAlpha)
    .composite([{input: tmpMaskPath, blend: 'over'}])
    .toFile(diffPath);

  unlinkSync(tmpMaskPath);

  if (diff.match) {
    return 0;
  }
  if ('diffCount' in diff) {
    return diff.diffCount;
  }
  return 0;
}
