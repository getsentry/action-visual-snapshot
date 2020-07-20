import {PNG} from 'pngjs';

export function resizeImage(img: PNG, width: number, height: number) {
  const {width: sourceWidth, height: sourceHeight} = img;

  // return if w/h is the same
  if (sourceWidth === width && sourceHeight === height) {
    return img;
  }

  const newImage = new PNG({width, height});
  // Iterate over pixels of target image width/height and copy pixels
  // from base image. If beyond dimensions of original image, then
  // make a transparent pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + (x % width)) << 2;
      // Check if outside of boundaries
      if (y >= img.height || x >= img.width) {
        // Pixel needs to be empty and transparent
        newImage.data[idx] = 0;
        newImage.data[idx + 1] = 0;
        newImage.data[idx + 2] = 0;
        newImage.data[idx + 3] = 0;
      } else {
        const sourceIdx = (sourceWidth * y + (x % sourceWidth)) << 2;
        newImage.data[idx] = img.data[sourceIdx];
        newImage.data[idx + 1] = img.data[sourceIdx + 1];
        newImage.data[idx + 2] = img.data[sourceIdx + 2];
        newImage.data[idx + 3] = img.data[sourceIdx + 3];
      }
    }
  }

  return newImage;
}
