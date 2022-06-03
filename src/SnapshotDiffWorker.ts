import {PixelmatchOptions} from './types';

import {multiCompare} from './util/multiCompare';
import {createDiff} from './util/createDiff';

const {parentPort} = require('node:worker_threads');
interface BaseDiff {
  taskId: number;
  baseHead: string;
  branchHead: string;
  outputDiffPath: string;
  pixelmatchOptions: PixelmatchOptions;
}

interface MultiSnapshotDiff extends BaseDiff {
  branchBase: string;
  outputMergedPath: string;
  snapshotName: string;
  pixelmatchOptions: PixelmatchOptions;
}

interface SingleSnapshotDiff extends BaseDiff {
  file: string;
  pixelmatchOptions: PixelmatchOptions;
}

export type InboundWorkerAction = MultiSnapshotDiff | SingleSnapshotDiff;
export interface OutboundWorkerAction {
  taskId: number;
  result: number;
}

const isMultiDiffMessage = (
  message: InboundWorkerAction
): message is MultiSnapshotDiff => 'snapshotName' in message;

parentPort.on(
  'message',
  async (message: SingleSnapshotDiff | MultiSnapshotDiff) => {
    let result: number;

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
      result = await createDiff(
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
    parentPort.postMessage(outboundMessage);
  }
);
