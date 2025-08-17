<script setup lang="ts">
defineProps<{
  value?: string;
  onChange?: () => string;
}>();

const emit = defineEmits<{
  (e: 'change', val: string): void;
}>();

function handleChange(e: Event) {
  const value = (e.target as HTMLInputElement).value;
  emit('change', value);
}
</script>

<template>
  <input type="color" @change="handleChange" :value="value" />
</template>
