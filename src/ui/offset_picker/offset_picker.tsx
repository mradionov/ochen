import { NumberInput, Select } from '@mantine/core';

export const OffsetPicker: React.FC<{
  value: string | number | undefined;
  onChange: (value: string | number | undefined) => void;
  extraOptions?: string[];
}> = ({ value, onChange, extraOptions = [] }) => {
  const selectValue = typeof value === 'number' ? 'number' : value;

  const onSelectChange = (newValue: string | null) => {
    if (newValue === 'none' || newValue == null) {
      onChange(undefined);
      return;
    }
    if (newValue === 'number') {
      onChange(0);
      return;
    }
    onChange(newValue);
  };

  const options = ['none', ...extraOptions, 'number'];

  const onNumberChange = (newNumberValue: string | number) => {
    if (typeof newNumberValue === 'string') {
      return;
    }
    onChange(newNumberValue);
  };

  return (
    <>
      <Select value={selectValue} data={options} onChange={onSelectChange} />
      {selectValue === 'number' && (
        <NumberInput value={value} onChange={onNumberChange} />
      )}
    </>
  );
};
