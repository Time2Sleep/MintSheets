<script setup lang="ts">
withDefaults(
  defineProps<{
    active?: boolean;
    visual?: 'primary' | 'link' | 'danger';
  }>(),
  {
    active: true,
    visual: 'primary',
  },
);
</script>

<template>
  <button v-if="visual === 'link'" class="bg-transparent underline">
    <slot />
  </button>
  <button
    v-else
    class="rounded-xl px-3 py-2 disabled:bg-light-secondary"
    :class="{
      'bg-light-secondary': !active,
      'bg-mint-primary': active && visual === 'primary',
      'bg-red-primary': active && visual === 'danger',
    }"
  >
    <slot />
  </button>
</template>
