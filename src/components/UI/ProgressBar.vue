<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  value: number;
  max: number;
  colorClass: string;
}>();

const computedStyle = computed(() => {
  const percentage = props.value >= props.max ? 100 : (props.value / props.max) * 100;
  return {
    width: `${percentage}%`,
  };
});
</script>

<template>
  <div class="w-full bg-dark-primary rounded-full overflow-hidden">
    <div :class="['h-2', colorClass]" :style="computedStyle"></div>
  </div>
</template>
