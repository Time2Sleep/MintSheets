<script setup lang="ts">
import { ref } from 'vue';
import { formDataToTransaction } from '../../services/transactions';
import { TransactionTypes, type Transaction, type TransactionFormData } from '../../types/finances';
import { getTodayDateFormatted } from '../../utils/date';
import TransactionForm from '../blocks/TransactionForm.vue';
import BaseButton from '../UI/BaseButton.vue';
import ModalWindow from '../UI/ModalWindow.vue';
import { computed, reactive, watch } from 'vue';
import LoadingSpinner from '../UI/LoadingSpinner.vue';

defineProps<{
  loading: boolean;
}>();

const emits = defineEmits<{
  (e: 'submit', transaction: Transaction): void;
  (e: 'delete', transaction: Transaction): void;
  (e: 'close'): void;
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
  emits('close');
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
  const editedTransaction = { id, ...transactionData };

  transaction.value = editedTransaction;

  emits('submit', editedTransaction);
};

const showDeleteConfirmation = ref(false);
const handleDelete = () => {
  showDeleteConfirmation.value = true;
};

const handleDeleteConfirmation = async () => {
  if (!transaction.value) return;

  showDeleteConfirmation.value = false;

  emits('delete', transaction.value);
};
</script>
<template>
  <ModalWindow
    :open="isOpen"
    title="Edit transaction"
    :container-style="{ width: '80vw' }"
    :class="{ 'pointer-events-none': loading }"
    @close="handleClose"
  >
    <div
      v-if="loading"
      class="w-full h-full bg-dark-primary opacity-50 absolute left-0 top-0 z-10 flex justify-center items-center"
    >
      <LoadingSpinner size="32px" />
    </div>

    <template v-if="transaction">
      <TransactionForm v-model:transaction="transactionFormData" @submit="handleSubmit" />

      <BaseButton class="mt-3" visual="danger" @click="handleDelete">Delete transaction</BaseButton>
    </template>

    <div class="mt-2 text-center">
      <slot />
    </div>

    <ModalWindow v-model:open="showDeleteConfirmation" :container-style="{ width: '60vw' }">
      <div class="mb-4 text-center">Are you sure you want to delete this transaction?</div>

      <div class="flex justify-between gap-4">
        <BaseButton class="flex-1" visual="link" @click="showDeleteConfirmation = false">No</BaseButton>
        <BaseButton class="flex-1" visual="danger" @click="handleDeleteConfirmation">Yes</BaseButton>
      </div>
    </ModalWindow>
  </ModalWindow>
</template>
