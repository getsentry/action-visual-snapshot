/* eslint-env node */
import path from 'path';
import {multiCompareODiff} from './util/multiCompareODiff';
import {getDiffODiff} from './util/getDiffODiff';

import {parentPort} from 'worker_threads';
import {ODiffOptions} from 'odiff-bin';

interface BaseDiff {
  taskId: number;
  file: string;
  baseHead: string;
  branchHead: string;
  outputDiffPath: string;
  diffOptions?: ODiffOptions;
}

interface MultiSnapshotDiff extends BaseDiff {
  branchBase: string;
  outputMergedPath: string;
}

export type InboundWorkerAction = MultiSnapshotDiff | BaseDiff;
export interface OutboundWorkerAction {
  taskId: number;
  result?: number;
  error?: any;
}

const isMultiDiffMessage = (
  message: InboundWorkerAction
): message is MultiSnapshotDiff => 'snapshotName' in message;

if (parentPort) {
  parentPort.on('message', async (message: BaseDiff | MultiSnapshotDiff) => {
    let result: number;
    const outputDiffPath = path.resolve(message.outputDiffPath, message.file);

    try {
      if (isMultiDiffMessage(message)) {
        result = await multiCompareODiff({
          branchBase: message.branchBase,
          baseHead: message.baseHead,
          branchHead: message.branchHead,
          outputDiffPath,
          outputMergedPath: message.outputMergedPath,
          diffOptions: message.diffOptions,
        });
      } else {
        result = await getDiffODiff(
          message.baseHead,
          message.branchHead,
          outputDiffPath,
          message.diffOptions
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
        error: e,
      };

      if (parentPort) {
        parentPort.postMessage(outboundMessage);
      } else {
        throw new Error('Failed to post to postMessage to parentPort.');
      }
    }
  });
} else {
  throw new Error("Can't find parent port");
}
