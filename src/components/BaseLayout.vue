<script setup lang="ts">
import TransactionForm from './TransactionForm.vue';
import FinanceCard from './UI/FinanceCard.vue';
import WrapperContainer from './UI/WrapperContainer.vue';
import { useFinanceStore } from '../stores/finances';
import { storeToRefs } from 'pinia';
import TransactionsList from './UI/TransactionsList.vue';

const financeStore = useFinanceStore();
const { monthSpending, monthIncome, currency } = storeToRefs(financeStore);
</script>

<template>
  <div class="flex flex-col gap-4 px-4 py-6">
    <h1 class="text-2xl">Hello, User!</h1>

    <div class="flex gap-4">
      <FinanceCard
        class="flex-1"
        title="Spending"
        :value="monthSpending"
        bar-color-class="bg-red-primary"
        :postfix="currency"
      />

      <FinanceCard
        class="flex-1"
        title="Income"
        :value="monthIncome"
        bar-color-class="bg-mint-primary"
        :postfix="currency"
      />
    </div>

    <WrapperContainer :gap="4">
      <TransactionForm />
    </WrapperContainer>

    <WrapperContainer>
      <TransactionsList />
    </WrapperContainer>
  </div>
</template>
