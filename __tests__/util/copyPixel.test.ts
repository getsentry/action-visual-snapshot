import {copyPixel} from '@app/util/copyPixel';

const PNG_DATA = [
  255,
  255,
  255,
  1,
  255,
  0,
  0,
  1,
  255,
  0,
  0,
  1,
  255,
  255,
  255,
  1,
];

describe('copyPixel', function() {
  it('can copy a pixel', function() {
    const mockPng = {
      width: 2,
      height: 2,
      data: PNG_DATA,
    };

    const target = {data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]};

    // @ts-ignore
    copyPixel(4, mockPng, target);

    expect(target.data).toEqual([
      0,
      0,
      0,
      0,
      255,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
    ]);
  });
});
