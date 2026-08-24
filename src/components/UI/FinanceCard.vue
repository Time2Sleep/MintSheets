<script setup lang="ts">
import { computed } from 'vue';
import ProgressBar from './ProgressBar.vue';

const props = withDefaults(
  defineProps<{
    value: number;
    title: string;
    barColorClass: string;
    maxLimit?: number;
    postfix?: string;
  }>(),
  {
    postfix: '₽',
    maxLimit: 0,
  },
);

const max = computed(() => {
  return props.maxLimit > 0 ? props.maxLimit : Math.max(props.value, 0);
});
</script>

<template>
  <div class="bg-dark-secondary p-4 rounded-2xl">
    <div class="text-xl">{{ value.toLocaleString() }} {{ postfix }}</div>

    <div class="mb-4">{{ title }}</div>

    <progress-bar :value="value" :max="max" :color-class="barColorClass" />
  </div>
</template>
