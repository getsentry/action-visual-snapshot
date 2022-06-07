import {multiCompareODiff} from '@app/util/multiCompareODiff';
import {performance} from 'perf_hooks';

function median(values: number[]): number {
  if (values.length === 0) {
    throw new Error('No inputs');
  }

  values.sort(function (a, b) {
    return a - b;
  });

  const half = Math.floor(values.length / 2);

  if (values.length % 2) {
    return values[half];
  }

  return (values[half - 1] + values[half]) / 2.0;
}

describe('multiCompare', function () {
  it('does a 3 way diff', async () => {
    const timings = [];
    for (let i = 0; i < 8 << 2; i++) {
      const start = performance.now();
      await multiCompareODiff({
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
      timings.push(performance.now() - start);
    }

    console.log(median(timings));
    // Hardcoded nb of diffed pixels
    // expect(result).toBe(8923);
  });
});
