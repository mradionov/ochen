export const asyncOnce = <Result, Args extends any[]>(
  fn: (...args: Args) => Promise<Result>,
  keyFn: (args: Args) => string = (arg) => String(arg),
) => {
  const cache = new Map<
    string,
    {
      promise?: Promise<Result>;
      success: boolean;
      value?: Result;
    }
  >();

  return (...args: Args) => {
    const key = keyFn(args);
    let entry = cache.get(key);

    if (!entry) {
      entry = { success: false };
      cache.set(key, entry);
    }

    if (entry.success) {
      return Promise.resolve(entry.value);
    }
    if (entry.promise) {
      return entry.promise;
    }

    entry.promise = fn(...args)
      .then((res) => {
        entry!.value = res;
        entry!.success = true;
        return res;
      })
      .catch((err) => {
        entry!.promise = undefined;
        throw err;
      });

    return entry.promise;
  };
};
