import {Worker} from 'worker_threads';
import type {
  InboundWorkerAction,
  OutboundWorkerAction,
} from '../SnapshotDiffWorker';
import * as Sentry from '@sentry/node';

// Unfortunately Omit does not work well across unions, so we need this
type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

type PromiseCallbacks = {
  task: InboundWorkerAction;
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
};
export class WorkerPool {
  workers: Worker[] = [];
  availableWorkers: Worker[] = [];
  tasks: Map<number, PromiseCallbacks> = new Map();

  constructor(workerPath: string, threads: number) {
    for (let i = 0; i < threads; i++) {
      const worker = new Worker(workerPath);

      this.workers.push(worker);
      this.availableWorkers.push(worker);

      worker.on('message', (message: OutboundWorkerAction) => {
        this.availableWorkers.push(worker);
        const task = this.tasks.get(message.taskId);
        if (task) {
          task.resolve(message);
        }
      });
      worker.on('error', (message: any) => {
        Sentry.captureException(new Error(message));

        this.availableWorkers.push(worker);
        const task = this.tasks.get(message.taskId);
        if (task) {
          task.reject(message);
        }
      });
    }
  }

  maybeProcessNext() {
    const taskKeys = [...this.tasks.keys()].reverse();
    while (this.availableWorkers.length > 0 && taskKeys.length > 0) {
      const taskId = taskKeys.pop();
      if (taskId === undefined) {
        continue;
      }
      this.process(taskId);
    }
  }

  process(taskId: InboundWorkerAction['taskId']) {
    const worker = this.availableWorkers.pop();

    if (!worker) {
      throw new Error(
        'No worker available, a task should not have been queued'
      );
    }

    const task = this.tasks.get(taskId);
    if (task === undefined) {
      throw new Error(`No task found for taskId: ${taskId}`);
    }

    worker.postMessage(task.task);
  }

  async enqueue(
    task: DistributiveOmit<InboundWorkerAction, 'taskId'>
  ): Promise<OutboundWorkerAction> {
    const taskId = this.tasks.size;

    const promise = new Promise<OutboundWorkerAction>((resolve, reject) => {
      const t: InboundWorkerAction = {...task, taskId};
      this.tasks.set(taskId, {task: t, resolve, reject});
    }).finally(() => {
      this.tasks.delete(taskId);
      this.maybeProcessNext();
    });

    this.maybeProcessNext();
    return promise;
  }

  async dispose() {
    for (const taskId of this.tasks.keys()) {
      const task = this.tasks.get(taskId);
      if (!task) {
        continue;
      }
      task.reject('WorkerPool disposed');
      this.tasks.delete(taskId);
    }
    for (const worker of this.workers) {
      worker.removeAllListeners();
      await worker.terminate();
    }
  }
}
