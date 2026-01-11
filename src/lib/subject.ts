export class Subject<T> {
  private listeners: ((event: T) => unknown)[] = [];

  public addListener(listenerToAdd: (event: T) => unknown): () => void {
    this.listeners.push(listenerToAdd);

    const unsubscribe = (): void => {
      this.removeListener(listenerToAdd);
    };

    return unsubscribe;
  }

  public addListenerOnce(listenerToAdd: (event: T) => unknown): () => void {
    const wrappedListener = (event: T): void => {
      this.removeListener(wrappedListener);
      listenerToAdd(event);
    };

    const unsubscribe = this.addListener(wrappedListener);

    return unsubscribe;
  }

  public removeListener(listenerToRemove: (event: T) => unknown): this {
    this.listeners = this.listeners.filter((listener) => {
      return listener !== listenerToRemove;
    });

    return this;
  }

  public removeAllListeners(): this {
    this.listeners = [];
    return this;
  }

  public emit = (event: T): this => {
    this.listeners.forEach((listener) => {
      // TODO: handle errors
      listener(event);
    });

    return this;
  };
}
