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
      (img1: any, img2: any, diff: any, width: number, height: number) => {
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
    expect(mockPngConstructor).toHaveBeenCalledWith({width: 9, height: 2});
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('snapshotName'),
      expect.anything()
    );

    expect(PNG.sync.write).toHaveBeenCalledWith({
      data: {
        '0': 1,
        '1': 1,
        '2': 1,
        '3': 1,
        '4': 2,
        '5': 2,
        '6': 2,
        '7': 1,
        '8': 3,
        '9': 3,
        '10': 3,
        '11': 1,
        '12': 1,
        '13': 1,
        '14': 1,
        '15': 1,
        '16': 2,
        '17': 2,
        '18': 2,
        '19': 1,
        '20': 3,
        '21': 3,
        '22': 3,
        '23': 1,
        '24': 10,
        '25': 10,
        '26': 10,
        '27': 0.5,
        '28': 11,
        '29': 11,
        '30': 11,
        '31': 0.5,
        '32': 12,
        '33': 12,
        '34': 12,
        '35': 0.5,
        '36': 4,
        '37': 4,
        '38': 4,
        '39': 1,
        '40': 5,
        '41': 5,
        '42': 5,
        '43': 1,
        '44': 6,
        '45': 6,
        '46': 6,
        '47': 1,
        '48': 4,
        '49': 4,
        '50': 4,
        '51': 1,
        '52': 5,
        '53': 5,
        '54': 5,
        '55': 1,
        '56': 6,
        '57': 6,
        '58': 6,
        '59': 1,
        '60': 13,
        '61': 13,
        '62': 13,
        '63': 0.5,
        '64': 14,
        '65': 14,
        '66': 14,
        '67': 0.5,
        '68': 15,
        '69': 15,
        '70': 15,
        '71': 0.5,
      },
      height: 2,
      width: 9,
    });
  });
});
