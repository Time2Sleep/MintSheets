<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: number;
  max: number;
  colorClass: string;
}>();

const computedStyle = computed(() => {
  if (props.value <= 0 || props.max <= 0 || props.max === 0) {
    return {
      width: '0%',
    };
  }

  const percentage = props.value >= props.max ? 100 : (props.value / props.max) * 100;
  return {
    width: `${percentage}%`,
  };
});
</script>

<template>
  <div
    class="w-full bg-dark-primary rounded-full overflow-hidden"
    role="progressbar"
    :aria-valuenow="value"
    aria-valuemin="0"
    :aria-valuemax="max"
  >
    <div :class="['h-2', colorClass]" :style="computedStyle"></div>
  </div>
</template>
