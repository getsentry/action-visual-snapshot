import {multiCompareODiff} from '@app/util/multiCompareODiff';
import {existsSync, unlinkSync} from 'fs';
import path from 'path';

describe('multiCompare', function () {
  afterEach(() => {
    const output = path.resolve(
      __dirname,
      './diffSnapshots/imgs/diff/test.png'
    );
    if (existsSync(output)) {
      unlinkSync(output);
    }
  });

  it('does a 3 way diff', async () => {
    const result = await multiCompareODiff({
      baseHead: './__tests__/util/diffSnapshots/imgs/base/acceptance/test.png',
      branchBase:
        './__tests__/util/diffSnapshots/imgs/mergeBase/acceptance/test.png',
      branchHead:
        './__tests__/util/diffSnapshots/imgs/current/acceptance/test.png',
      outputDiffPath: path.resolve(
        __dirname,
        './diffSnapshots/imgs/diff/test.png'
      ),
      outputMergedPath: './__tests__/util/diffSnapshots/imgs/merged',
    });

    // Hardcoded nb of diffed pixels
    expect(result).toBe(8923);
  });
});
