<script setup lang="ts">
type Option = string | number | Record<string, string | number>;

const props = withDefaults(
  defineProps<{
    options: string[] | number[] | Record<string, string | number>[];
    placeholder?: string;
    labelKey?: string;
    label?: string;
    name: string;
  }>(),
  {
    placeholder: '',
    labelKey: '',
    label: '',
  },
);

const value = defineModel<Option>();

const getOptionLabel = (option: Option): string | number => {
  if (typeof option === 'string' || typeof option === 'number') return option;

  return option[props.labelKey];
};
</script>

<template>
  <label class="w-full flex flex-col gap-1">
    <span v-if="label" class="text-sm">
      {{ label }}
    </span>
    <select
      v-model="value"
      :name="name"
      :aria-label="placeholder || 'select'"
      class="select appearance-none block w-full bg-dark-primary text-light placeholder:text-light-secondary border border-dark-primary focus:outline-none focus:border-mint-primary rounded-xl px-3 py-2 pr-10"
      :class="{ 'text-light-secondary': !value }"
    >
      <option value="" disabled selected hidden>{{ placeholder }}</option>
      <option :value="undefined" disabled selected hidden>{{ placeholder }}</option>
      <option v-for="option in options" :key="getOptionLabel(option)" class="flex p-4" :value="option">
        {{ getOptionLabel(option) }}
      </option>
    </select>
  </label>
</template>

<style scoped>
.select {
  background-image: url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="%23A7A7A7"/></svg>');
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 20px;
}

.select:focus {
  background-image: url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 15L12 9L18 15" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="%23A7A7A7"/></svg>');
}
</style>
