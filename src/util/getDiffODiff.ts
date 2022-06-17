import {compare, ODiffOptions} from 'odiff-bin';
import {existsSync} from 'fs';

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

  const diff = await compare(file1, file2, diffPath, {
    antialiasing: false,
    failOnLayoutDiff: false,
    outputDiffMask: false,
    threshold: 0.1,
    ...options,
  });

  if ('diffCount' in diff) {
    return diff.diffCount;
  }

  return 0;
}
