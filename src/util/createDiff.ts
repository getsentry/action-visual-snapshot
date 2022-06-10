import path from 'path';

import {getDiffObin} from './getDiffObin';

/**
 * Creates a combined diff of @file1 and @file2 and writes to disk
 *
 */
export async function createDiff(
  snapshotName: string,
  outputDir: string,
  file1: string,
  file2: string
): Promise<number> {
  const {result} = await getDiffObin(
    file1,
    file2,
    path.resolve(outputDir, snapshotName)
  );

  return result;
}
