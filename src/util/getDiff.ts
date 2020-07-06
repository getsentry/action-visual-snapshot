import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';

import {fileToPng} from './fileToPng';
import {ImageDimensionError} from './ImageDimensionError';

type PixelmatchOptions = Exclude<Parameters<typeof pixelmatch>[5], undefined>;

export async function getDiff(
  file1: string,
  file2: string,
  {includeAA = true, threshold = 0.2, ...options}: PixelmatchOptions = {}
) {
  const [img1, img2] = await Promise.all([fileToPng(file1), fileToPng(file2)]);
  const {width, height} = img1;
  const diff = new PNG({width, height});

  if (width !== img2.width || height !== img2.height) {
    throw new ImageDimensionError();
  }

  const result = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    includeAA,
    threshold,
    ...options,
  });

  return {
    result,
    diff,
    img1,
    img2,
  };
}
