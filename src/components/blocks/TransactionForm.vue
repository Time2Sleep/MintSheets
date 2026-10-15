<script setup lang="ts">
import { computed } from 'vue';
import BaseButton from '../UI/BaseButton.vue';
import BaseInput from '../UI/BaseInput.vue';
import BaseSelect from '../UI/BaseSelect.vue';
import { TransactionTypes, type TransactionFormData } from '../../types/finances.ts';
import { useCurrentFinanceStore } from '../../stores/financeStoreRegistry.ts';
import { storeToRefs } from 'pinia';
import LoadingSpinner from '../UI/LoadingSpinner.vue';

withDefaults(
  defineProps<{
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);

const transaction = defineModel<TransactionFormData>('transaction', { required: true });
const emits = defineEmits<{
  (e: 'submit', transaction: TransactionFormData): void;
}>();

const financeStore = useCurrentFinanceStore();
const { spendingCategoriesTitles, incomeCategoriesTitles } = storeToRefs(financeStore);

const options = computed<string[]>(() =>
  transaction.value.type === TransactionTypes.SPENDING ? spendingCategoriesTitles.value : incomeCategoriesTitles.value,
);

const changeTransactionType = (type: TransactionFormData['type']) => {
  if (transaction.value.type === type) return;

  transaction.value.type = type;
  transaction.value.category = '';
};

const isFormValid = computed<boolean>(
  () =>
    transaction.value.date !== '' &&
    transaction.value.category !== '' &&
    Number.isFinite(Number(transaction.value.amount)) &&
    Number(transaction.value.amount) > 0,
);

const handleSubmit = () => {
  if (!isFormValid.value) return;

  emits('submit', transaction.value);
};
</script>

<template>
  <form class="flex flex-col gap-3" @submit.prevent="handleSubmit">
    <BaseInput v-model="transaction.date" name="date" placeholder="Date" type="date" icon="calendar" />

    <div class="flex gap-3">
      <BaseButton
        class="flex-1"
        :active="transaction.type === TransactionTypes.SPENDING"
        @click.prevent="changeTransactionType(TransactionTypes.SPENDING)"
      >
        Spending
      </BaseButton>
      <BaseButton
        class="flex-1"
        :active="transaction.type === TransactionTypes.INCOME"
        @click.prevent="changeTransactionType(TransactionTypes.INCOME)"
      >
        Income
      </BaseButton>
    </div>

    <BaseSelect v-model="transaction.category" name="category" placeholder="Category" :options="options" />
    <BaseInput v-model.number="transaction.amount" name="amount" placeholder="Amount" type="number" />
    <BaseInput v-model="transaction.comment" name="comment" placeholder="Comment" />

    <BaseButton v-if="loading" aria-label="loading" :disabled="true">
      <LoadingSpinner />
    </BaseButton>

    <BaseButton v-else type="submit" :disabled="!isFormValid">Confirm</BaseButton>
  </form>
</template>
