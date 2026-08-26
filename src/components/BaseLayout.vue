<script setup lang="ts">
import TransactionForm from './TransactionForm.vue';
import FinanceCard from './UI/FinanceCard.vue';
import WrapperContainer from './UI/WrapperContainer.vue';
</script>

<template>
  <div class="flex flex-col gap-4 px-4 py-6">
    <h1 class="text-2xl">Hello, User!</h1>

    <div class="flex gap-4">
      <FinanceCard class="flex-1" title="Spending" :value="100000" bar-color-class="bg-red-primary" />

      <FinanceCard class="flex-1" title="Income" :value="100000" bar-color-class="bg-mint-primary" />
    </div>

    <WrapperContainer :gap="4">
      <TransactionForm />
    </WrapperContainer>

    <WrapperContainer> List of transactions will be here... </WrapperContainer>
  </div>
</template>
