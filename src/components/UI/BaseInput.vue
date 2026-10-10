<script setup lang="ts">
import BaseIcon from './BaseIcon.vue';

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    label?: string;
    type?: 'text' | 'number' | 'date';
    name: string;
    icon?: string;
  }>(),
  {
    placeholder: '',
    type: 'text',
    label: '',
    icon: '',
  },
);

const emits = defineEmits<{
  (e: 'change', payload: Event): void;
}>();

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
  <label class="w-full flex flex-col gap-1 relative">
    <span v-if="label" class="text-sm">
      {{ label }}
    </span>
    <input
      v-model="value"
      :name="name"
      :placeholder="placeholder"
      :aria-label="label || placeholder || name + ' input'"
      class="block w-full appearance-none bg-dark-primary text-light placeholder:text-light-secondary border border-dark-primary focus:outline-none focus:border-mint-primary rounded-xl py-2 pl-3"
      :class="icon ? 'pr-10' : 'pr-3'"
      :type="type"
      @focus="handleFocus($event)"
      @change="(payload) => emits('change', payload)"
    />

    <BaseIcon
      v-if="icon"
      class="absolute right-3 top-[50%] translate-y-[-50%] pointer-events-none"
      :icon="icon"
      size="16px"
    />
  </label>
</template>
