/* eslint-env node */
import {multiCompare} from './util/multiCompare';
import {getDiffODiff} from './util/getDiffODiff';

import {parentPort} from 'worker_threads';

process.on('warning', e => console.warn(e.stack));

interface BaseDiff {
  taskId: number;
  baseHead: string;
  branchHead: string;
  outputDiffPath: string;
  pixelmatchOptions?: PixelmatchOptions;
}

interface MultiSnapshotDiff extends BaseDiff {
  branchBase: string;
  outputMergedPath: string;
  snapshotName: string;
}

interface SingleSnapshotDiff extends BaseDiff {
  file: string;
}

export type InboundWorkerAction = MultiSnapshotDiff | SingleSnapshotDiff;
export interface OutboundWorkerAction {
  taskId: number;
  result?: number;
}

const isMultiDiffMessage = (
  message: InboundWorkerAction
): message is MultiSnapshotDiff => 'snapshotName' in message;

if (parentPort) {
  parentPort.on(
    'message',
    async (message: SingleSnapshotDiff | MultiSnapshotDiff) => {
      let result: number;

      try {
        if (isMultiDiffMessage(message)) {
          result = await multiCompare({
            branchBase: message.branchBase,
            baseHead: message.baseHead,
            branchHead: message.branchHead,
            outputDiffPath: message.outputDiffPath,
            outputMergedPath: message.outputMergedPath,
            snapshotName: message.snapshotName,
            pixelmatchOptions: message.pixelmatchOptions,
          });
        } else {
          result = await getDiffODiff(
            message.file,
            message.outputDiffPath,
            message.baseHead,
            message.branchHead,
            message.pixelmatchOptions
          );
        }

        const outboundMessage: OutboundWorkerAction = {
          taskId: message.taskId,
          result,
        };

        if (parentPort) {
          parentPort.postMessage(outboundMessage);
        } else {
          throw new Error('Failed to post to postMessage to parentPort.');
        }
      } catch (e) {
        const outboundMessage: OutboundWorkerAction = {
          taskId: message.taskId,
        };

        if (parentPort) {
          parentPort.postMessage(outboundMessage);
        } else {
          throw new Error('Failed to post to postMessage to parentPort.');
        }
      }
    }
  );
} else {
  throw new Error("Can't find parent port");
}
