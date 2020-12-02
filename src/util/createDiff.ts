import {promises as fs} from 'fs';
import path from 'path';
import {PNG} from 'pngjs';

import {PixelmatchOptions} from '@app/types';

import {getDiff} from './getDiff';

/**
 * Creates a combined diff of @file1 and @file2 and writes to disk
 *
 */
export async function createDiff(
  snapshotName: string,
  output: string,
  file1: string,
  file2: string,
  pixelmatchOptions?: PixelmatchOptions
) {
  const {result, diff} = await getDiff(file1, file2, pixelmatchOptions);

  if (result > 0) {
    await fs.writeFile(
      path.resolve(output, snapshotName),
      PNG.sync.write(diff)
    );
  }

  return result;
}
