import {PNG} from 'pngjs';
import {resizeImage} from '@app/util/resizeImage';

const makeTestImage = () => {
  const image = new PNG({width: 2, height: 1});

  const BYTES_PER_PIXEL = 4;
  const data = Buffer.allocUnsafe(image.width * image.height * BYTES_PER_PIXEL);

  for (let i = 0; i < data.length; i += BYTES_PER_PIXEL) {
    data[i] = 255;
    data[i + 1] = 128;
    data[i + 2] = 64;
    data[i + 3] = 32;
  }

  image.data = data;
  return image;
};

describe('resizeImage', () => {
  it('adds column', () => {
    const resized = resizeImage(makeTestImage(), 3, 1);

    expect(resized.width).toBe(3);
    expect(resized.data.slice(8, 12)).toEqual(Buffer.from([0, 0, 0, 0]));
  });
  it('adds row', () => {
    const resized = resizeImage(makeTestImage(), 2, 2);

    expect(resized.height).toBe(2);
    expect(resized.data.slice(8, 12)).toEqual(Buffer.from([0, 0, 0, 0]));
  });
  it('preserves old data', () => {
    const resized = resizeImage(makeTestImage(), 3, 2);

    expect(resized.data.slice(0, 8)).toEqual(makeTestImage().data.slice(0, 8));
  });
});
