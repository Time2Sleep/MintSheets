<script setup lang="ts">
withDefaults(
  defineProps<{
    active?: boolean;
    visual?: 'primary' | 'link';
  }>(),
  {
    active: true,
    visual: 'primary',
  },
);
</script>

<template>
  <button
    v-if="visual === 'primary'"
    class="rounded-xl px-3 py-2 disabled:bg-light-secondary"
    :class="{ 'bg-light-secondary': !active, 'bg-mint-primary': active }"
  >
    <slot />
  </button>
  <button v-else-if="visual === 'link'" class="bg-transparent underline">
    <slot />
  </button>
</template>
