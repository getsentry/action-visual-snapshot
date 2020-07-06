import {PNG} from 'pngjs';

/**
 * Creates a combined diff of @file1 and @file2 and writes to disk
 *
 */
export async function getCombinedDiff(img1: PNG, img2: PNG, diff: PNG) {
  const {width, height} = diff;
  const combinedWidth = width * 3;
  const combined = new PNG({width: combinedWidth, height});
  const images = [img1, img2, diff];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < combinedWidth; x++) {
      const idx = (width * y + (x % width)) << 2;
      const targetIdx = (combinedWidth * y + x) << 2;
      const img = images[Math.floor(x / width)];

      combined.data[targetIdx] = img.data[idx];
      combined.data[targetIdx + 1] = img.data[idx + 1];
      combined.data[targetIdx + 2] = img.data[idx + 2];
      combined.data[targetIdx + 3] = img.data[idx + 3];
    }
  }

  return combined;
}
