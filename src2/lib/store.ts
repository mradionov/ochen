import { Subject } from './subject';

interface Store {
  subscribe(listener: () => unknown): () => void;
  getSnapshot(): unknown;
}

export abstract class SyncStore<TState> implements Store {
  protected readonly changed: Subject<void>;

  constructor() {
    this.changed = new Subject();
  }

  abstract getSnapshot(): TState;

  readonly subscribe = (listener: () => unknown) => {
    return this.changed.addListener(listener);
  };

  protected readonly emit = () => {
    this.changed.emit();
  };
}
