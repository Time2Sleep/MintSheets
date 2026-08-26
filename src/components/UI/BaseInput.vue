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

const handleFocus = ({ target, isTrusted }: FocusEvent) => {
  if (
    !isTrusted ||
    props.type !== 'date' ||
    !navigator.userActivation?.isActive ||
    !(target instanceof HTMLInputElement)
  ) {
    return;
  }

  target.showPicker();
};
</script>

<template>
  <input
    v-model="value"
    :aria-label="placeholder || 'input'"
    class="bg-dark-primary text-light placeholder:text-light-secondary border border-dark-primary focus:outline-none focus:border-mint-primary rounded-xl p-3"
    :type="type"
    :placeholder="placeholder"
    @focus="handleFocus($event)"
  />
</template>
