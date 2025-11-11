export function defaults<T>(def: T, actual: T): T {
  const final = { ...def };

  Object.keys(actual).forEach((key) => {
    const value = actual[key];
    if (value != null) {
      final[key] = value;
    }
  });

  return final;
}
