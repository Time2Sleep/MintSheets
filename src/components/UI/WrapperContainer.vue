<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    gap?: number;
  }>(),
  {
    gap: 0,
  },
);

const gapStyle = computed(() => {
  return props.gap * 4 + 'px';
});
</script>

<template>
  <div class="bg-dark-secondary p-4 rounded-2xl flex flex-col" :style="{ gap: gapStyle }">
    <slot />
  </div>
</template>
