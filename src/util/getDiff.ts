import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';
import {PixelmatchOptions} from '@app/types';

import {compare} from 'odiff-bin';

import {fileToPng} from './fileToPng';
import {resizeImage} from './resizeImage';

interface DiffResults {
  result: number;
  diff: PNG;
  img1: PNG;
  img2: PNG;
}

export async function getDiffObin(
  file1: string,
  file2: string,
  diffPath: string
): Promise<Pick<DiffResults, 'result'>> {
  const diff = await compare(file1, file2, diffPath, {
    antialiasing: true,
    failOnLayoutDiff: false,
    outputDiffMask: true,
    threshold: 0.1,
  });

  if ('diffCount' in diff) {
    return {result: diff.diffCount};
  }

  return {
    result: 0,
  };
}

export async function getDiff(
  file1: string | PNG,
  file2: string | PNG,
  {includeAA = true, threshold = 0.1, ...options}: PixelmatchOptions = {}
): Promise<DiffResults> {
  let img1 = typeof file1 === 'string' ? await fileToPng(file1) : file1;
  let img2 = typeof file2 === 'string' ? await fileToPng(file2) : file2;
  const width = Math.max(img1.width, img2.width);
  const height = Math.max(img1.height, img2.height);
  const diff = new PNG({width, height});

  if (img1.width !== img2.width || img1.height !== img2.height) {
    // resize images
    img1 = resizeImage(img1, width, height);
    img2 = resizeImage(img2, width, height);
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
