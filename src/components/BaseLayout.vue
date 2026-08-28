<script setup lang="ts">
import TransactionForm from './TransactionForm.vue';
import FinanceCard from './UI/FinanceCard.vue';
import WrapperContainer from './UI/WrapperContainer.vue';
import { useFinanceStore } from '../stores/finances';
import { storeToRefs } from 'pinia';
import TransactionsList from './UI/TransactionsList.vue';
import BaseButton from './UI/BaseButton.vue';
import { loginWithGoogle } from '../services/googleAuth';
import { useGoogleStore } from '../stores/google';

const financeStore = useFinanceStore();
const { monthSpending, monthIncome, currency } = storeToRefs(financeStore);

const googleStore = useGoogleStore();
const { isConnected, isAuthError } = storeToRefs(googleStore);
</script>

<template>
  <div class="flex flex-col gap-4 px-4 py-6">
    <template v-if="isConnected">
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
    </template>

    <template v-else>
      <BaseButton @click="loginWithGoogle">Sign In</BaseButton>
      <div v-if="isAuthError" class="text-red-primary">Sorry, something went wrong there. Try again.</div>
    </template>
  </div>
</template>
