import {findChangedPixels} from '@app/util/findChangedPixels';

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

describe('findChangedPixels', function() {
  it('finds two changed pixels', function() {
    const mockPng = {
      width: 2,
      height: 2,
      data: PNG_DATA,
    };

    // @ts-ignore
    expect(findChangedPixels(mockPng)).toEqual([4, 8]);
  });
});
