import {compare, ODiffOptions} from 'odiff-bin';

interface DiffResults {
  result: number;
}

export async function getDiffODiff(
  file1: string,
  file2: string,
  diffPath: string,
  options: ODiffOptions = {}
): Promise<Pick<DiffResults, 'result'>> {
  const diff = await compare(file1, file2, diffPath, {
    antialiasing: false,
    failOnLayoutDiff: false,
    outputDiffMask: false,
    threshold: 0.1,
    ...options,
  });

  if ('diffCount' in diff) {
    return {result: diff.diffCount};
  }

  return {
    result: 0,
  };
}
