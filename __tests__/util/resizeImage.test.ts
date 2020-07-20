import {resizeImage} from '@app/util/resizeImage';

const PNG_DATA = [
  1,
  1,
  1,
  0.5,
  2,
  2,
  2,
  0.5,
  3,
  3,
  3,
  0.5,
  4,
  4,
  4,
  0.5,
  5,
  5,
  5,
  0.5,
  6,
  6,
  6,
  0.5,
];

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

describe('resizeImage', function() {
  it('diffs two equal sized images and creates a combined image', async function() {
    const oldImage = {width: 3, height: 2, data: PNG_DATA};
    // @ts-ignore
    const newImage = resizeImage(oldImage, 4, 3);

    // new image
    expect(mockPngConstructor).toHaveBeenCalledWith({width: 4, height: 3});

    // eslint-disable-next-line
    expect(newImage).toEqual({
      data: {
        // Original first row
        '0': 1,
        '1': 1,
        '2': 1,
        '3': 0.5,
        '4': 2,
        '5': 2,
        '6': 2,
        '7': 0.5,
        '8': 3,
        '9': 3,
        '10': 3,
        '11': 0.5,

        // Additional column added (width 3 --> 4)
        '12': 0,
        '13': 0,
        '14': 0,
        '15': 0,

        // Original 2nd row
        '16': 4,
        '17': 4,
        '18': 4,
        '19': 0.5,
        '20': 5,
        '21': 5,
        '22': 5,
        '23': 0.5,
        '24': 6,
        '25': 6,
        '26': 6,
        '27': 0.5,

        // Additional column added (width 3 --> 4)
        '28': 0,
        '29': 0,
        '30': 0,
        '31': 0,

        // Additional row (height 2->3)
        '32': 0,
        '33': 0,
        '34': 0,
        '35': 0,
        '36': 0,
        '37': 0,
        '38': 0,
        '39': 0,
        '40': 0,
        '41': 0,
        '42': 0,
        '43': 0,
        '44': 0,
        '45': 0,
        '46': 0,
        '47': 0,
      },
      width: 4,
      height: 3,
    });
  });
});
