<script setup lang="ts">
import TransactionForm from './TransactionForm.vue';
import FinanceCard from './UI/FinanceCard.vue';
import WrapperContainer from './UI/WrapperContainer.vue';
import { useFinanceStore } from '../stores/finances';
import { storeToRefs } from 'pinia';

const financeStore = useFinanceStore();
const { monthSpending, monthIncome, transactionsReversed } = storeToRefs(financeStore);
</script>

<template>
  <div class="flex flex-col gap-4 px-4 py-6">
    <h1 class="text-2xl">Hello, User!</h1>

    <div class="flex gap-4">
      <FinanceCard class="flex-1" title="Spending" :value="monthSpending" bar-color-class="bg-red-primary" />

      <FinanceCard class="flex-1" title="Income" :value="monthIncome" bar-color-class="bg-mint-primary" />
    </div>

    <WrapperContainer :gap="4">
      <TransactionForm />
    </WrapperContainer>

    <WrapperContainer>
      <!-- TODO: Implement transaction list -->
      <h2 class="text-xl pb-2">Transactions</h2>
      <p v-if="!transactionsReversed.length" class="text-light-secondary">No transactions yet</p>
      <ul v-else class="flex flex-col gap-4">
        <li
          v-for="transaction in transactionsReversed"
          :key="transaction.id"
          class="grid grid-cols-2 text-light-secondary text-sm border-b border-light-secondary pb-2"
        >
          <span>{{ transaction.date }}</span>
          <span class="text-right">{{ transaction.category }}</span>
          <span>{{ transaction.comment }}</span>
          <span class="text-right">{{ transaction.amount }}</span>
        </li>
      </ul>
    </WrapperContainer>
  </div>
</template>
