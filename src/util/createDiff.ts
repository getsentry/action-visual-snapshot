import path from 'path';

import {getDiffObin} from './getDiff';

/**
 * Creates a combined diff of @file1 and @file2 and writes to disk
 *
 */
export async function createDiff(
  snapshotName: string,
  output: string,
  file1: string,
  file2: string
): Promise<number> {
  const {result} = await getDiffObin(
    file1,
    file2,
    path.resolve(output, snapshotName)
  );

  return result;
}
