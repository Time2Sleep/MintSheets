<script setup lang="ts">
import { computed, reactive } from 'vue';
import { router } from '../../router';
import { CURRENCIES, type Currency } from '../../constants/currencies';
import BaseLayout from '../BaseLayout.vue';
import BaseButton from '../UI/BaseButton.vue';
import BaseInput from '../UI/BaseInput.vue';
import BaseSelect from '../UI/BaseSelect.vue';
import WrapperContainer from '../UI/WrapperContainer.vue';
import EditableList from '../blocks/EditableList.vue';

const handleSubmit = () => {
  console.log('Handled settings submit');

  router.push({ name: 'main' });
};

const form = reactive<{
  spendingCategories: string[];
  incomeCategories: string[];
  balance: string;
  currency: Currency;
}>({
  spendingCategories: [],
  incomeCategories: [],
  balance: '',
  currency: CURRENCIES[0],
});

const isContinueDisabled = computed<boolean>(
  () => !form.spendingCategories.length || !form.incomeCategories.length || !form.currency || form.balance === '',
);
</script>

<template>
  <BaseLayout :hide-nav="true">
    <form @submit.prevent="handleSubmit">
      <WrapperContainer :gap="2">
        <BaseSelect v-model="form.currency" name="currency" label="Currency" :options="CURRENCIES" label-key="name" />

        <BaseInput
          v-model.number="form.balance"
          name="balance"
          placeholder="100 000"
          type="number"
          label="Initial balance"
        />

        <EditableList
          v-model="form.spendingCategories"
          placeholder="Food"
          label="Spending categories"
          name="spendingCategories"
          empty-text="Add at least one spending category"
          max-height="20vh"
        />
        <EditableList
          v-model="form.incomeCategories"
          placeholder="Salary"
          label="Income categories"
          name="incomeCategories"
          empty-text="Add at least one income category"
          max-height="20vh"
        />

        <BaseButton :disabled="isContinueDisabled" class="mt-4">Continue</BaseButton>
      </WrapperContainer>
    </form>
  </BaseLayout>
</template>
