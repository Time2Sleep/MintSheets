<script setup lang="ts">
withDefaults(
  defineProps<{
    gap?: number;
  }>(),
  {
    gap: 0,
  },
);
</script>

<template>
  <div class="bg-dark-secondary p-4 rounded-2xl flex flex-col" :class="`gap-${gap}`">
    <slot />
  </div>
</template>
