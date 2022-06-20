import {multiCompareODiff} from '@app/util/multiCompareODiff';

describe('multiCompare', function () {
  it('does a 3 way diff', async () => {
    const result = await multiCompareODiff({
      snapshotName: 'test.png',
      baseHead: './__tests__/util/diffSnapshots/imgs/base/acceptance/test.png',
      branchBase:
        './__tests__/util/diffSnapshots/imgs/mergeBase/acceptance/test.png',
      branchHead:
        './__tests__/util/diffSnapshots/imgs/current/acceptance/test.png',
      outputDiffPath: './__tests__/util/diffSnapshots/imgs/diff',
      outputMergedPath: './__tests__/util/diffSnapshots/imgs/merged',
    });

    // Hardcoded nb of diffed pixels
    expect(result).toBe(16120);
  });
});
