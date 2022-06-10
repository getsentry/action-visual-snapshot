/* eslint-env node */
import {PixelmatchOptions} from './types';

import {createDiff} from './util/createDiff';
import {multiCompareODiff} from './util/multiCompareODiff';

import {parentPort} from 'worker_threads';

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
          console.log('Multi diff');
          result = await multiCompareODiff({
            branchBase: message.branchBase,
            baseHead: message.baseHead,
            branchHead: message.branchHead,
            outputDiffPath: message.outputDiffPath,
            outputMergedPath: message.outputMergedPath,
            snapshotName: message.snapshotName,
          });
        } else {
          console.log('Single diff');
          result = await createDiff(
            message.file,
            message.outputDiffPath,
            message.baseHead,
            message.branchHead
          );
        }

        console.log('Change', result);
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
        console.log('Error from catch', e?.message, e);
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
  console.log("Couldn't find parentPort");
  throw new Error("Can't find parent port");
}
