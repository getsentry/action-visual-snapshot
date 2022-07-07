import path from 'path';
import {getDiffODiff} from '@app/util/getDiffODiff';

describe('getDiffODiff', function () {
  it('outputs a diffmask', async () => {
    const outFile = path.resolve(
      __dirname,
      'diffSnapshots/imgs/diff/diffmask.png'
    );

    const result = await getDiffODiff(
      path.resolve(__dirname, './diffSnapshots/imgs/base/acceptance/test.png'),
      path.resolve(
        __dirname,
        './diffSnapshots/imgs/current/acceptance/test.png'
      ),
      outFile,
      {outputDiffMask: true}
    );

    expect(result).toBe(10952);
  });

  it('outputs a full image with alpha', async () => {
    const outFile = path.resolve(
      __dirname,
      'diffSnapshots/imgs/diff/alpha-diff.png'
    );

    const result = await getDiffODiff(
      path.resolve(__dirname, './diffSnapshots/imgs/base/acceptance/test.png'),
      path.resolve(
        __dirname,
        './diffSnapshots/imgs/current/acceptance/test.png'
      ),
      outFile,
      {outputDiffMask: false}
    );

    expect(result).toBe(10952);
  });
});
