<script lang='ts'>
  export let extraOptions: string[] = [];
  export let value: string;
  export let onChange: (value: string | number | undefined) => void;

  $: selectedValue = isNumber(value) ? 'number' : value;
  $: options = ['none', ...extraOptions, 'number'];

  function handleSelectChange(e) {
    const newSelectedValue = e.target.value;
    if (newSelectedValue === 'none') {
      onChange?.(undefined);
      return;
    }
    if (newSelectedValue === 'number') {
      return;
    }
    onChange?.(newSelectedValue);
  }

  function handleNumberChange(e) {
    const newNumberValue = Number(e.target.value);
    onChange?.(newNumberValue);
  }

  function isNumber(numStr) {
    return !Number.isNaN(parseInt(numStr));
  }
</script>

<div>
  <select bind:value={selectedValue} on:change={handleSelectChange}>
    {#each options as option}
      <option value={option}>{option}</option>
    {/each}
  </select>
  {#if selectedValue === 'number'}
    <input type='number' value={value} on:change={handleNumberChange} />
  {/if}
</div>
