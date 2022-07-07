import {PNG} from 'pngjs';

export function resizeImage(img: PNG, width: number, height: number) {
  const {width: sourceWidth, height: sourceHeight} = img;

  // return if w/h is the same
  if (sourceWidth === width && sourceHeight === height) {
    return img;
  }

  // Initialize the image buffers through PNG
  const newImage = new PNG({width, height});

  // whether the input bitmap has 4 bytes per pixel (rgb and alpha) or 3 (rgb - no alpha).
  // Keeping this hardcoded like it was, but we should probably read the value from the IHDR header.
  const BYTES_PER_PX = 4;
  const bytesPerSourceRow = sourceWidth * BYTES_PER_PX;
  const bytesPerTargetRow = width * BYTES_PER_PX;

  for (let y = 0; y < sourceHeight; y++) {
    const sourceRowStart = y * bytesPerSourceRow;
    const sourceRowEnd = y * bytesPerSourceRow + bytesPerSourceRow;

    const rowData = img.data.slice(sourceRowStart, sourceRowEnd);

    const targetRowStart = y * bytesPerTargetRow;
    rowData.copy(newImage.data, targetRowStart, 0, rowData.length);
  }

  return newImage;
}
