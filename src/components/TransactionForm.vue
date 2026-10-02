<script setup lang="ts">
import { computed, reactive } from 'vue';
import BaseButton from './UI/BaseButton.vue';
import BaseInput from './UI/BaseInput.vue';
import BaseSelect from './UI/BaseSelect.vue';
import { TransactionTypes, type TransactionFormData } from '../types/finances';
import { getTodayDateFormatted } from '../utils/date';
import { storeToRefs } from 'pinia';
import { refreshGoogleToken } from '../services/googleAuth';
import { useGoogleStore } from '../stores/google';
import { useCurrentFinanceStore } from '../stores/financeStoreRegistry';
import { SessionStatus } from '../types/auth';

const financeStore = useCurrentFinanceStore();
const { spendingCategoriesTitles, incomeCategoriesTitles } = storeToRefs(financeStore);

const googleStore = useGoogleStore();

const form = reactive<TransactionFormData>({
  date: getTodayDateFormatted(),
  category: '',
  amount: '',
  comment: '',
  type: TransactionTypes.SPENDING,
});

const options = computed<string[]>(() =>
  form.type === TransactionTypes.SPENDING ? spendingCategoriesTitles.value : incomeCategoriesTitles.value,
);

const changeTransactionType = (type: TransactionFormData['type']) => {
  if (form.type === type) return;

  form.type = type;
  form.category = '';
};

const isFormValid = computed<boolean>(() => {
  return form.date !== '' && form.category !== '' && Number.isFinite(Number(form.amount)) && Number(form.amount) > 0;
});

const handleSubmit = () => {
  if (!isFormValid.value) return;
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
  <form class="flex flex-col gap-3" @submit.prevent="handleSubmit">
    <BaseInput v-model="form.date" name="date" placeholder="Date" type="date" icon="calendar" />

    <div class="flex gap-3">
      <BaseButton
        class="flex-1"
        :active="form.type === TransactionTypes.SPENDING"
        @click.prevent="changeTransactionType(TransactionTypes.SPENDING)"
      >
        Spending
      </BaseButton>
      <BaseButton
        class="flex-1"
        :active="form.type === TransactionTypes.INCOME"
        @click.prevent="changeTransactionType(TransactionTypes.INCOME)"
      >
        Income
      </BaseButton>
    </div>

    <BaseSelect v-model="form.category" name="category" placeholder="Category" :options="options" />
    <BaseInput v-model.number="form.amount" name="amount" placeholder="Amount" type="number" />
    <BaseInput v-model="form.comment" name="comment" placeholder="Comment" />
    <BaseButton type="submit" :disabled="!isFormValid">Confirm</BaseButton>
  </form>
</template>
