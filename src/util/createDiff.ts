/* eslint-env node */
import {promises as fs} from 'fs';
import path from 'path';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';

export async function createDiff(
  snapshotName: string,
  output: string,
  file1: string,
  file2: string
) {
  const [fileContent1, fileContent2] = await Promise.all([
    fs.readFile(file1),
    fs.readFile(file2),
  ]);

  const img1 = PNG.sync.read(fileContent1);
  const img2 = PNG.sync.read(fileContent2);
  const {width, height} = img1;
  const diff = new PNG({width, height});

  const result = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1,
  });

  if (result > 0) {
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

    await fs.writeFile(
      path.resolve(output, snapshotName),
      PNG.sync.write(combined)
    );
  }

  return result;
}
