<script setup lang="ts">
import { reactive } from 'vue';
import { TransactionTypes, type TransactionFormData } from '../types/finances.ts';
import { getTodayDateFormatted } from '../utils/date.ts';
import { refreshGoogleToken } from '../services/googleAuth.ts';
import { useGoogleStore } from '../stores/google.ts';
import { useCurrentFinanceStore } from '../stores/financeStoreRegistry.ts';
import { SessionStatus } from '../types/auth.ts';
import TransactionForm from './blocks/TransactionForm.vue';

const financeStore = useCurrentFinanceStore();

const googleStore = useGoogleStore();

const form = reactive<TransactionFormData>({
  date: getTodayDateFormatted(),
  category: '',
  amount: '',
  comment: '',
  type: TransactionTypes.SPENDING,
});

const handleSubmit = () => {
  financeStore.addTransaction({ ...form });
  clearForm();

  if (googleStore.sessionStatus === SessionStatus.OFFLINE) {
    refreshGoogleToken(googleStore.userInfo?.sub || '');
  }
};

const clearForm = () => {
  form.amount = '';
  form.comment = '';
  form.type = TransactionTypes.SPENDING;
};
</script>

<template>
  <TransactionForm v-model:transaction="form" @submit="handleSubmit" />
</template>
