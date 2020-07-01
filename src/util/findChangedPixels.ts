import {PNG} from 'pngjs';

export function findChangedPixels(img: PNG) {
  const {height, width} = img;
  const locations = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;

      // should be 255 if change was detected at pixel
      if (
        img.data[idx] !== 255 ||
        img.data[idx + 1] !== 255 ||
        img.data[idx + 2] !== 255
      ) {
        locations.push(idx);
      }
    }
  }
  return locations;
}
