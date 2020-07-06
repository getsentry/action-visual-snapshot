import {promises as fs} from 'fs';
import path from 'path';
import {PNG} from 'pngjs';

import {getDiff} from './getDiff';
import {getCombinedDiff} from './getCombinedDiff';

/**
 * Creates a combined diff of @file1 and @file2 and writes to disk
 *
 */
export async function createDiff(
  snapshotName: string,
  output: string,
  file1: string,
  file2: string
) {
  const {result, diff, img1, img2} = await getDiff(file1, file2);

  if (result > 0) {
    const combined = await getCombinedDiff(img1, img2, diff);

    await fs.writeFile(
      path.resolve(output, snapshotName),
      PNG.sync.write(combined)
    );
  }

  return result;
}
