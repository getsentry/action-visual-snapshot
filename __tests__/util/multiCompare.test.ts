import {multiCompare} from '@app/util/multiCompare';
import {performance} from 'perf_hooks';

describe('multiCompare', function () {
  it('does a 3 way diff', async () => {
    let result = 0;
    for (let i = 0; i < 10; i++) {
      const start = performance.now();
      result = await multiCompare({
        snapshotName: 'test.png',
        baseHead:
          './__tests__/util/diffSnapshots/imgs/base/acceptance/test.png',
        branchBase:
          './__tests__/util/diffSnapshots/imgs/mergeBase/acceptance/test.png',
        branchHead:
          './__tests__/util/diffSnapshots/imgs/current/acceptance/test.png',
        outputDiffPath: './__tests__/util/diffSnapshots/imgs/diff',
        outputMergedPath: './__tests__/util/diffSnapshots/imgs/merged',
      });

      console.log(performance.now() - start);
    }

    // Hardcoded nb of diffed pixels
    expect(result).toBe(16120);
  });
});
