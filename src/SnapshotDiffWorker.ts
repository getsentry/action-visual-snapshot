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

export interface TerminationAction {
  type: 'terminate';
}

export type InboundWorkerDiffAction = MultiSnapshotDiff | BaseDiff;
export interface OutboundWorkerDiffAction {
  taskId: number;
  result?: number;
  error?: any;
}

const isMultiDiffMessage = (
  message: InboundWorkerDiffAction
): message is MultiSnapshotDiff => 'snapshotName' in message;

const isTerminationMessage = (
  action: InboundWorkerDiffAction | TerminationAction
): action is TerminationAction =>
  'type' in action && action.type === 'terminate';

async function onInboundMessage(
  message: InboundWorkerDiffAction | TerminationAction
) {
  if (isTerminationMessage(message)) {
    // stop receiving inbound messages
    if (parentPort) {
      parentPort.off('message', onInboundMessage);
    }
    process.exit(0);
  }

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

    const outboundMessage: OutboundWorkerDiffAction = {
      taskId: message.taskId,
      result,
    };

    if (parentPort) {
      parentPort.postMessage(outboundMessage);
    } else {
      throw new Error('Failed to post to postMessage to parentPort.');
    }
  } catch (e) {
    const outboundMessage: OutboundWorkerDiffAction = {
      taskId: message.taskId,
      error: e,
    };

    if (parentPort) {
      parentPort.postMessage(outboundMessage);
    } else {
      throw new Error('Failed to post to postMessage to parentPort.');
    }
  }
}

if (parentPort) {
  parentPort.on('message', onInboundMessage);
} else {
  throw new Error("Can't find parent port");
}
