<script setup lang="ts">
import { TransactionTypes, type Transaction } from '../../types/finances';
import LoadingSpinner from './LoadingSpinner.vue';

defineProps<{
  title: string;
  data: Transaction[];
  currency: string;
}>();

const emits = defineEmits<{
  (e: 'transaction-click', transaction: Transaction): void;
}>();
</script>

<template>
  <h2 class="text-xl pb-3">{{ title }}</h2>

  <div
    v-for="transaction in data"
    :key="transaction.id"
    class="flex justify-between items-center pb-1"
    :class="{ 'animate-pulse': transaction.pending }"
    role="button"
    tabindex="0"
    @click="emits('transaction-click', transaction)"
    @keydown.enter="emits('transaction-click', transaction)"
  >
    <div>
      <div>{{ transaction.comment }}</div>
      <div class="text-light-secondary text-xs">{{ transaction.category }}</div>
    </div>

    <div
      class="text-xl flex items-center whitespace-nowrap"
      :class="{ 'text-green-primary': transaction.type === TransactionTypes.INCOME }"
    >
      <LoadingSpinner v-if="transaction.pending" class="mr-2" />
      <div>{{ transaction.type === TransactionTypes.INCOME ? '+' : '-' }}</div>
      <div>{{ transaction.amount }} {{ currency }}</div>
    </div>
  </div>
</template>
