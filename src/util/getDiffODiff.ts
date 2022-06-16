import {compare, ODiffOptions} from 'odiff-bin';

export async function getDiffODiff(
  file1: string,
  file2: string,
  diffPath: string,
  options: ODiffOptions = {}
): Promise<number> {
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
