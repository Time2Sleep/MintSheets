<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    placeholder?: string;
    type?: 'text' | 'number' | 'date';
  }>(),
  {
    placeholder: '',
    type: 'text',
  },
);

const value = defineModel<string | number>();

const handleFocus = ({ target }: FocusEvent) => {
  if (target && props.type === 'date') {
    (target as HTMLInputElement).showPicker();
  }
};
</script>

<template>
  <input
    v-model="value"
    class="bg-dark-primary text-light placeholder:text-light-secondary focus:outline-none focus:border-mint-primary rounded-xl p-3"
    :type="type"
    :placeholder="placeholder"
    @focus="handleFocus($event)"
  />
</template>
