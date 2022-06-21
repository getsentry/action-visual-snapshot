import {compare, ODiffOptions} from 'odiff-bin';
import {existsSync} from 'fs';
import path from 'path';

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

  const diff = await compare(file1, file2, diffPath, {
    antialiasing: false,
    failOnLayoutDiff: false,
    outputDiffMask: false,
    threshold: 0.1,
    ...options,
    // @ts-ignore
    __binaryPath,
  });

  if (diff.match) {
    // If there was a match, then the nb diffed pixels was below threshold
    return 0;
  }

  if ('diffCount' in diff) {
    return diff.diffCount;
  }

  return 0;
}
