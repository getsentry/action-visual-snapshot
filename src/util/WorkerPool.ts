import {Worker} from 'worker_threads';
import type {
  InboundWorkerDiffAction,
  OutboundWorkerDiffAction,
  TerminationAction,
} from '../SnapshotDiffWorker';
import * as Sentry from '@sentry/node';

// Unfortunately Omit does not work well across unions, so we need this
type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

type PromiseCallbacks = {
  task: InboundWorkerDiffAction;
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
};

const TERMINATION_ACTION: TerminationAction = {
  type: 'terminate',
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

      worker.on('message', (message: OutboundWorkerDiffAction) => {
        this.availableWorkers.push(worker);
        const task = this.tasks.get(message.taskId);
        if (task) {
          if (message.error) {
            task.reject(message.error);
            return;
          }
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

  process(taskId: InboundWorkerDiffAction['taskId']) {
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

  async maybeGracefulTermination(): Promise<any[]> {
    const promises: Promise<number | undefined>[] = [];

    for (const worker of this.workers) {
      const promise = new Promise<number | undefined>(resolve => {
        function onExit(code: number | undefined) {
          resolve(code);
        }
        worker.postMessage(TERMINATION_ACTION);
        worker.on('exit', onExit);
      });

      promises.push(promise);
    }

    const timeoutPromise = new Promise<any[]>(resolve => {
      setTimeout(() => {
        resolve([]);
      }, 5000);
    });

    return Promise.race([Promise.all(promises), timeoutPromise]);
  }

  async enqueue(
    task: DistributiveOmit<InboundWorkerDiffAction, 'taskId'>
  ): Promise<OutboundWorkerDiffAction> {
    const taskId = this.tasks.size;

    const promise = new Promise<OutboundWorkerDiffAction>((resolve, reject) => {
      const t: InboundWorkerDiffAction = {...task, taskId};
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

    await this.maybeGracefulTermination();

    for (const worker of this.workers) {
      await worker.terminate();
    }
  }
}
