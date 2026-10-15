<script setup lang="ts">
import { formDataToTransaction } from '../../services/transactions';
import { TransactionTypes, type Transaction, type TransactionFormData } from '../../types/finances';
import { getTodayDateFormatted } from '../../utils/date';
import TransactionForm from '../blocks/TransactionForm.vue';
import ModalWindow from '../UI/ModalWindow.vue';
import { computed, reactive, watch } from 'vue';

defineProps<{
  loading: boolean;
}>();

const transaction = defineModel<Transaction>('transaction');

const transactionFormData = reactive<TransactionFormData>({
  amount: '',
  type: TransactionTypes.SPENDING,
  category: '',
  date: getTodayDateFormatted(),
  comment: '',
});

const isOpen = computed(() => !!transaction.value);

const handleClose = () => {
  transaction.value = undefined;
};

watch(transaction, () => {
  if (!transaction.value) return;

  transactionFormData.amount = transaction.value.amount.toString();
  transactionFormData.type = transaction.value.type;
  transactionFormData.date = transaction.value.date;
  transactionFormData.category = transaction.value.category;
  transactionFormData.comment = transaction.value.comment || '';
});

const handleSubmit = () => {
  if (!transaction.value) return;

  const transactionData = formDataToTransaction(transactionFormData);
  if (!transactionData) return;

  const id = transaction.value.id;
  transaction.value = { id, ...transactionData };
};
</script>
<template>
  <ModalWindow :open="isOpen" title="Edit transaction" :container-style="{ width: '80vw' }" @close="handleClose">
    <template v-if="transaction">
      <TransactionForm v-model:transaction="transactionFormData" :loading="loading" @submit="handleSubmit" />
    </template>

    <div class="mt-2 text-center">
      <slot />
    </div>
  </ModalWindow>
</template>
