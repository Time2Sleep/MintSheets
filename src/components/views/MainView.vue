<script setup lang="ts">
import TransactionForm from '../TransactionForm.vue';
import FinanceCard from '../UI/FinanceCard.vue';
import WrapperContainer from '../UI/WrapperContainer.vue';
import { useFinanceStore } from '../../stores/finances';
import { storeToRefs } from 'pinia';
import TransactionsList from '../UI/TransactionsList.vue';

const financeStore = useFinanceStore();
const { monthSpending, monthIncome, currency } = storeToRefs(financeStore);
</script>

<template>
  <div class="sticky top-6 bg-linear-to-b from-dark-primary to-transparent from-90% pb-4">
    <h1 class="text-2xl mb-4">Hello, User!</h1>
    <RouterLink to="analytics" class="flex gap-4">
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
    </RouterLink>
  </div>

  <WrapperContainer :gap="4" class="mb-4">
    <TransactionForm />
  </WrapperContainer>

  <WrapperContainer class="flex-1 overflow-hidden rounded-br-none rounded-bl-none">
    <div class="h-[5px] min-h-[5px] mx-auto rounded bg-light-secondary w-[50px] mb-4"></div>
    <TransactionsList />
  </WrapperContainer>
</template>
