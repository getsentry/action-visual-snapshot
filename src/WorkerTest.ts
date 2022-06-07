import path from 'path';
import {OutboundWorkerAction} from './SnapshotDiffWorker';
import {WorkerPool} from './util/WorkerPool';

const workerPool = new WorkerPool(
  path.resolve(__dirname, 'SnapshotDiffWorker.import.js'),
  2
);
const promises: Promise<void | OutboundWorkerAction>[] = [];

for (let i = 0; i < 8 << 4; i++) {
  const promise = workerPool
    .enqueue({
      file: 'cat.png',
      baseHead: path.resolve(__dirname, './test/in/cat.png'),
      branchHead: path.resolve(__dirname, './test/out/cat.png'),
      outputDiffPath: path.resolve(__dirname, './test/diff/'),
    })
    .catch(err => {
      console.log('Error', err);
    });

  promises.push(promise);
}

(async () => {
  await Promise.all(promises);
  workerPool.dispose();
})();
