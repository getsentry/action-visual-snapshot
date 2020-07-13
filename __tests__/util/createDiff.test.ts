import fs from 'fs';
import {PNG} from 'pngjs';
import pixelmatch from 'pixelmatch';

import {fileToPng} from '@app/util/fileToPng';
import {createDiff} from '@app/util/createDiff';

const PNG_DATA = [
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  1,
  3,
  3,
  3,
  1,
  4,
  4,
  4,
  1,
  5,
  5,
  5,
  1,
  6,
  6,
  6,
  1,
];

jest.mock('@app/util/fileToPng', () => ({
  fileToPng: jest.fn(() => ({
    width: 3,
    height: 2,
    data: PNG_DATA,
  })),
}));

jest.mock('fs', () => ({
  promises: {
    writeFile: jest.fn(),
  },
}));

jest.mock('pixelmatch', () => jest.fn());

const mockPngConstructor = jest.fn((opts: any) => ({
  data: {},
  height: opts.height,
  width: opts.width,
}));

jest.mock('pngjs', () => {
  // eslint-disable-next-line
  function PNG(opts: any) {
    return mockPngConstructor(opts);
  }
  PNG.sync = {
    write: jest.fn(() => 1),
    read: jest.fn(() => ({
      width: 3,
      height: 2,
      data: PNG_DATA,
    })),
  };

  return {PNG};
});

describe('createDiff', function() {
  it('diffs two equal sized images and creates a combined image', async function() {
    (pixelmatch as jest.Mock).mockImplementation(
      (_img1: any, _img2: any, diff: any) => {
        for (let x = 0; x < 6; x++) {
          diff[x * 4] = 10 + x;
          diff[x * 4 + 1] = 10 + x;
          diff[x * 4 + 2] = 10 + x;
          diff[x * 4 + 3] = 0.5;
        }
        return 1;
      }
    );
    await createDiff('snapshotName', './', './img1.png', './img2.png');

    expect(fileToPng).toHaveBeenCalledWith('./img1.png');
    expect(fileToPng).toHaveBeenCalledWith('./img2.png');

    expect(mockPngConstructor).toHaveBeenCalledWith({width: 3, height: 2});
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('snapshotName'),
      expect.anything()
    );

    // eslint-disable-next-line
    expect(PNG.sync.write).toHaveBeenCalledWith({
      data: {
        '0': 10,
        '1': 10,
        '2': 10,
        '3': 0.5,
        '4': 11,
        '5': 11,
        '6': 11,
        '7': 0.5,
        '8': 12,
        '9': 12,
        '10': 12,
        '11': 0.5,
        '12': 13,
        '13': 13,
        '14': 13,
        '15': 0.5,
        '16': 14,
        '17': 14,
        '18': 14,
        '19': 0.5,
        '20': 15,
        '21': 15,
        '22': 15,
        '23': 0.5,
      },
      height: 2,
      width: 3,
    });
  });
});
