import { NumberInput } from '@mantine/core';

export const NumberView = <S extends { value: number }>({
  state,
  onStateChange,
}: {
  state: S;
  onStateChange: (state: S) => void;
}) => {
  const handleChange = (value: number | string) => {
    onStateChange({ ...state, value: Number(value) });
  };

  return (
    <NumberInput
      value={state.value}
      onChange={handleChange}
      size="xs"
      inputSize="8"
    />
  );
};
