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
  <h1 class="text-2xl">Hello, User!</h1>
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

  <WrapperContainer :gap="4">
    <TransactionForm />
  </WrapperContainer>

  <RouterLink to="history">
    <WrapperContainer>
      <TransactionsList />
    </WrapperContainer>
  </RouterLink>
</template>
