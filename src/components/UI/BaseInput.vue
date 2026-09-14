<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    placeholder?: string;
    label?: string;
    type?: 'text' | 'number' | 'date';
    name: string;
  }>(),
  {
    placeholder: '',
    type: 'text',
    label: '',
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
  <label class="w-full flex flex-col gap-1">
    <span v-if="label" class="text-sm">
      {{ label }}
    </span>
    <input
      v-model="value"
      :name="name"
      :placeholder="placeholder"
      :aria-label="label || placeholder || name + ' input'"
      class="bg-dark-primary text-light placeholder:text-light-secondary border border-dark-primary focus:outline-none focus:border-mint-primary rounded-xl py-2 px-3"
      :type="type"
      @focus="handleFocus($event)"
    />
  </label>
</template>
