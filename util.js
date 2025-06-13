export function defaults(def, actual) {
  const final = {...def};

  Object.keys(actual).forEach((key) => {
    const value = actual[key];
    if (value != null) {
      final[key] = value;
    }
  });

  return final;
}
