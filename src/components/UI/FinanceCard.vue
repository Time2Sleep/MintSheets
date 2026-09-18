<script setup lang="ts">
import { computed } from 'vue';
import ProgressBar from './ProgressBar.vue';
import WrapperContainer from './WrapperContainer.vue';
import type { Currency } from '../../constants/currencies';

const props = withDefaults(
  defineProps<{
    value: number;
    title: string;
    barColorClass: string;
    maxLimit?: number;
    currency: Currency;
  }>(),
  {
    maxLimit: 0,
  },
);

const max = computed(() => {
  return props.maxLimit > 0 ? props.maxLimit : Math.max(props.value, 0);
});
</script>

<template>
  <WrapperContainer class="active:scale-98 transition-transform duration-200">
    <div class="text-xl">{{ value.toLocaleString() }} {{ currency.symbol }}</div>

    <div class="mb-4">{{ title }}</div>

    <progress-bar :value="value" :max="max" :color-class="barColorClass" />
  </WrapperContainer>
</template>
