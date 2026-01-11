<script lang="ts">
  export let extraOptions: string[] = [];
  export let value: string | number | undefined = undefined;
  export let onChange: (value: string | number | undefined) => void;

  $: selectedValue = isNumber(value) ? 'number' : value;
  $: options = ['none', ...extraOptions, 'number'];

  function handleSelectChange(e: Event & { currentTarget: HTMLSelectElement }) {
    const newSelectedValue = e.currentTarget?.value;
    if (newSelectedValue === 'none') {
      value = undefined;
      onChange?.(undefined);
      return;
    }
    if (newSelectedValue === 'number') {
      value = newSelectedValue;
      return;
    }

    value = newSelectedValue;
    onChange?.(newSelectedValue);
  }

  function handleNumberChange(e: Event & { currentTarget: HTMLInputElement }) {
    const newNumberValue = Number(e.currentTarget.value);
    onChange?.(newNumberValue);
  }

  function isNumber(numStr: string | number | undefined) {
    if (numStr == null) {
      return false;
    }
    if (typeof numStr === 'string') {
      return !Number.isNaN(parseInt(numStr));
    }
    return true;
  }
</script>

<div>
  <select value={selectedValue} on:change={handleSelectChange}>
    {#each options as option (option)}
      <option value={option}>{option}</option>
    {/each}
  </select>
  {#if selectedValue === 'number'}
    <input type="number" {value} on:change={handleNumberChange} />
  {/if}
</div>
