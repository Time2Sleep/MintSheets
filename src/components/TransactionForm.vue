<script setup lang="ts">
import { reactive } from 'vue';
import BaseButton from './UI/BaseButton.vue';
import BaseInput from './UI/BaseInput.vue';
import BaseSelect from './UI/BaseSelect.vue';
import type { TransactionWithoutId } from '../types/finances.ts';
import { getTodayDateFormatted } from '../utils/date.ts';

const form = reactive<TransactionWithoutId>({
  date: getTodayDateFormatted(),
  category: '',
  amount: undefined,
  comment: '',
});

const options = ['Category 1', 'Category 2', 'Category 3'];

const handleSubmit = () => {
  console.log('Form submitted:', form);
};
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <BaseInput v-model="form.date" placeholder="Date" type="date" />
    <BaseSelect v-model="form.category" placeholder="Category" :options="options" />
    <BaseInput v-model.number="form.amount" placeholder="Amount" type="number" />
    <BaseInput v-model="form.comment" placeholder="Comment" />
    <BaseButton>Confirm</BaseButton>
  </form>
</template>
