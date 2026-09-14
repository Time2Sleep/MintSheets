<script setup lang="ts">
import { computed } from 'vue';
import ProgressBar from './ProgressBar.vue';
import WrapperContainer from './WrapperContainer.vue';
import { useFinanceStore } from '../../stores/finances';
import { storeToRefs } from 'pinia';

const financeStore = useFinanceStore();
const { currency } = storeToRefs(financeStore);

const props = withDefaults(
  defineProps<{
    value: number;
    title: string;
    barColorClass: string;
    maxLimit?: number;
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
