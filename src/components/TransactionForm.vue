<script setup lang="ts">
import { computed, reactive } from 'vue';
import BaseButton from './UI/BaseButton.vue';
import BaseInput from './UI/BaseInput.vue';
import BaseSelect from './UI/BaseSelect.vue';
import { TransactionTypes, type TransactionWithoutId } from '../types/finances';
import { getTodayDateFormatted } from '../utils/date';
import { useFinanceStore } from '../stores/finances';
import { storeToRefs } from 'pinia';
import { refreshGoogleToken } from '../services/googleAuth';
import { useGoogleStore } from '../stores/google';

const financeStore = useFinanceStore();
const { categories } = storeToRefs(financeStore);

const googleStore = useGoogleStore();

const form = reactive<TransactionWithoutId>({
  date: getTodayDateFormatted(),
  category: '',
  amount: undefined,
  comment: '',
  type: TransactionTypes.SPENDING,
});

const isFormValid = computed<boolean>(() => {
  return form.date !== '' && form.category !== '' && Number.isFinite(Number(form.amount)) && Number(form.amount) > 0;
});

const handleSubmit = () => {
  if (!isFormValid.value) return;
  financeStore.addTransaction({ ...form });
  clearForm();

  if (!googleStore.googleToken) {
    refreshGoogleToken();
  }
};

const clearForm = () => {
  form.category = '';
  form.amount = undefined;
  form.comment = '';
  form.type = TransactionTypes.SPENDING;
};
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <BaseInput v-model="form.date" placeholder="Date" type="date" />

    <div class="flex gap-4">
      <BaseButton
        class="flex-1"
        :active="form.type === TransactionTypes.SPENDING"
        @click.prevent="form.type = TransactionTypes.SPENDING"
      >
        Spending
      </BaseButton>
      <BaseButton
        class="flex-1"
        :active="form.type === TransactionTypes.INCOME"
        @click.prevent="form.type = TransactionTypes.INCOME"
      >
        Income
      </BaseButton>
    </div>

    <BaseSelect v-model="form.category" placeholder="Category" :options="categories" />
    <BaseInput v-model.number="form.amount" placeholder="Amount" type="number" />
    <BaseInput v-model="form.comment" placeholder="Comment" />
    <BaseButton type="submit" :disabled="!isFormValid">Confirm</BaseButton>
  </form>
</template>
