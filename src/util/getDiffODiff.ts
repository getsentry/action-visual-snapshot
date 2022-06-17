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

  console.log('Using binary path', __binaryPath, __dirname);

  const diff = await compare(file1, file2, diffPath, {
    antialiasing: false,
    failOnLayoutDiff: false,
    outputDiffMask: false,
    threshold: 0.1,
    ...options,
    // @ts-ignore
    __binaryPath,
  });

  if ('diffCount' in diff) {
    return diff.diffCount;
  }

  return 0;
}
