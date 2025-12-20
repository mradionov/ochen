import { Deferred } from '../../src2/lib/deferred.ts';

type RunFn<T> = () => Promise<T>;

type Task<T> = {
  deferred: Deferred<T>;
  runFn: RunFn<T>;
};

export class TaskQueue {
  private isBusy = false;
  private tasks: Task<any>[] = [];

  constructor() {}

  run<T>(runFn: RunFn<T>): Promise<T> {
    const deferred = new Deferred<T>();

    const task: Task<T> = {
      deferred,
      runFn,
    };

    this.tasks.push(task);
    void this.maybeRunNext();

    return deferred.promise;
  }

  private async maybeRunNext() {
    if (this.isBusy || this.tasks.length === 0) {
      return;
    }

    const nextTask = this.tasks.shift();
    if (!nextTask) {
      return;
    }

    const { runFn, deferred } = nextTask;

    this.isBusy = true;

    try {
      const result = await runFn();
      deferred.resolve(result);
    } catch (err) {
      deferred.reject(err);
    } finally {
      this.isBusy = false;
      void this.maybeRunNext();
    }
  }
}
