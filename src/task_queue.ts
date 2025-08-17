import { Deferred } from '@/deferred.ts';

type RunFn<T> = () => Promise<T>;

type Task<T> = {
  deferred: Deferred<T>;
  runFn: RunFn<T>;
};

export class TaskQueue {
  private isBusy = false;
  private tasks: Task[] = [];

  constructor() {}

  run<T>(runFn: RunFn<T>): Promise<T> {
    const deferred = new Deferred();

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
    this.isBusy = true;

    const { runFn, deferred } = this.tasks.shift();

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
