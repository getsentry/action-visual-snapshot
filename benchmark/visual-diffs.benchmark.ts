import path from 'path';
import {PNG} from 'pngjs';
import fs from 'fs';
import {performance} from 'perf_hooks';

import {getDiff} from '../src/util/getDiff';
import {getDiffOdiff} from '../src/util/getDiffOdiff';

import {multiCompare} from '../src/util/multiCompare';
import {multiCompareODiff} from '../src/util/multiCompareODiff';

const quantile = (arr: number[], q: number) => {
  const pos = (arr.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (arr[base + 1] !== undefined) {
    return arr[base] + rest * (arr[base + 1] - arr[base]);
  } else {
    return arr[base];
  }
};

const f = new Intl.NumberFormat();

const benchmark = async (
  n: number,
  cb: (iteration: number) => Promise<any>,
  results: any[]
) => {
  const timings: number[] = [];
  const name = (cb.name || 'Anonymous') + ` n=${n}`;

  for (let i = 0; i < n; i++) {
    const start = performance.now();
    await cb(i);
    timings.push(performance.now() - start);
  }

  // eslint-disable-next-line
  timings.sort();

  results.push({
    name,
    timings,
    p75: quantile(timings, 0.75),
    p99: quantile(timings, 0.799),
  });
};

const outdir = path.resolve(__dirname, 'results');
const mergedDir = path.resolve(__dirname, 'results/merged');
const resultPath = path.resolve(outdir, 'diff.png');

const baseHead = path.resolve(__dirname, '../benchmark/baseHead.png');
const branchBase = path.resolve(__dirname, '../benchmark/branchBase.png');
const branchHead = path.resolve(__dirname, '../benchmark/branchHead.png');

async function getDiffBenchmark() {
  const {result, diff} = await getDiff(baseHead, branchHead);
  // We need to make sure we output to file inside the benchmark so
  // that is resembled odiffs's functionality. We dont io to skew the benchmark
  if (result > 0) {
    fs.writeFileSync(resultPath, PNG.sync.write(diff));
  }
}

async function getDiffOdiffBenchmark() {
  await getDiffOdiff(baseHead, branchHead, resultPath);
}

async function multiCompareBenchmark() {
  await multiCompare({
    snapshotName: 'test.png',
    baseHead,
    branchBase,
    branchHead,
    outputDiffPath: outdir,
    outputMergedPath: mergedDir,
  });
}

async function multiCompareODiffBenchmark() {
  await multiCompareODiff({
    snapshotName: 'test.png',
    baseHead,
    branchBase: baseHead,
    branchHead: baseHead,
    outputDiffPath: outdir,
    outputMergedPath: mergedDir,
  });
}

async function multiCompareBenchmarkSlow() {
  await multiCompare({
    snapshotName: 'test.png',
    baseHead,
    branchBase: baseHead,
    branchHead: baseHead,
    outputDiffPath: outdir,
    outputMergedPath: mergedDir,
  });
}

async function multiCompareODiffBenchmarkSlow() {
  await multiCompareODiff({
    snapshotName: 'test.png',
    baseHead,
    branchBase,
    branchHead,
    outputDiffPath: outdir,
    outputMergedPath: mergedDir,
  });
}

function prepare() {
  // eslint-disable-next-line
  console.log('//////////////////////////////');
}

function logResults(results: any) {
  const slowest = results.sort((a: any, b: any) => b.p75 - a.p75)[0];
  const fastest = results.sort((a: any, b: any) => a.p75 - b.p75)[0];

  // eslint-disable-next-line
  console.log('Slowest was', slowest.name, f.format(slowest.p75) + 'ms');
  // eslint-disable-next-line
  console.log('Fastest was', fastest.name, f.format(fastest.p75) + 'ms');
}

(async () => {
  const singleDiffResults: any[] = [];
  await benchmark(10, getDiffBenchmark, singleDiffResults);
  // await benchmark(100, getDiffBenchmark, singleDiffResults);
  // await benchmark(1000, getDiffBenchmark, singleDiffResults);

  await benchmark(10, getDiffOdiffBenchmark, singleDiffResults);
  // await benchmark(100, getDiffOdiffBenchmark, singleDiffResults);
  // await benchmark(1000, getDiffOdiffBenchmark, singleDiffResults);
  logResults(singleDiffResults);

  prepare();
  const multiDiffResults: any[] = [];
  await benchmark(10, multiCompareBenchmark, multiDiffResults);
  // await benchmark(100, multiCompareBenchmark, multiDiffResults);
  // await benchmark(500, multiCompareBenchmark, multiDiffResults);
  // await benchmark(1000, multiCompareBenchmark, multiDiffResults);

  await benchmark(10, multiCompareODiffBenchmark, multiDiffResults);
  // await benchmark(100, multiCompareODiffBenchmark, multiDiffResults);
  // await benchmark(500, multiCompareODiffBenchmark, multiDiffResults);
  // await benchmark(1000, multiCompareODiffBenchmark, multiDiffResults);

  logResults(multiDiffResults);

  prepare();
  const multiDiffResultsSlow: any[] = [];
  await benchmark(10, multiCompareBenchmarkSlow, multiDiffResultsSlow);
  // await benchmark(100, multiCompareBenchmarkSlow, multiDiffResultsSlow);
  // await benchmark(500, multiCompareBenchmarkSlow, multiDiffResultsSlow);
  // await benchmark(1000, multiCompareBenchmarkSlow, multiDiffResultsSlow);

  await benchmark(10, multiCompareODiffBenchmarkSlow, multiDiffResultsSlow);
  // await benchmark(100, multiCompareODiffBenchmarkSlow, multiDiffResultsSlow);
  // await benchmark(500, multiCompareODiffBenchmarkSlow, multiDiffResultsSlow);
  // await benchmark(1000, multiCompareODiffBenchmarkSlow, multiDiffResultsSlow);

  logResults(multiDiffResultsSlow);
})();
