<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFinanceStore } from '../../stores/finances';
import TransactionItem from './TransactionItem.vue';

const financeStore = useFinanceStore();
const { transactionsFormatted, currency } = storeToRefs(financeStore);
</script>

<template>
  <div>
    <p v-if="!Object.keys(transactionsFormatted).length" class="text-light-secondary">No transactions yet</p>
    <ul v-else class="flex flex-col gap-4">
      <li v-for="(data, key) in transactionsFormatted" :key="key" class="block text-sm pb-2">
        <TransactionItem :title="key" :data="data" :currency="currency" />
      </li>
    </ul>
  </div>
</template>
