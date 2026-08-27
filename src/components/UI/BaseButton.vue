<script setup lang="ts">
withDefaults(
  defineProps<{
    active?: boolean;
  }>(),
  {
    active: true,
  },
);
</script>

<template>
  <button
    class="rounded-xl p-3 disabled:bg-light-secondary"
    :class="{ 'bg-light-secondary': !active, 'bg-mint-primary': active }"
  >
    <slot />
  </button>
</template>
