<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { router } from '../../router';
import { CURRENCIES } from '../../constants/currencies';
import BaseLayout from '../BaseLayout.vue';
import BaseButton from '../UI/BaseButton.vue';
import BaseInput from '../UI/BaseInput.vue';
import BaseSelect from '../UI/BaseSelect.vue';
import WrapperContainer from '../UI/WrapperContainer.vue';
import EditableList from '../blocks/EditableList.vue';
import { storeToRefs } from 'pinia';
import { useCurrentFinanceStore } from '../../stores/financeStoreRegistry';

const financeStore = useCurrentFinanceStore();
const { spendingCategories, incomeCategories, currency, initialBalance } = storeToRefs(financeStore);
const { saveSettings } = financeStore;

const form = reactive({
  spendingCategories: { ...spendingCategories.value },
  incomeCategories: { ...incomeCategories.value },
  balance: initialBalance.value.toString(),
  currency: currency.value,
});

const isContinueDisabled = computed<boolean>(
  () =>
    !Object.keys(form.spendingCategories).length ||
    !Object.keys(form.incomeCategories).length ||
    !form.currency ||
    +form.balance < 0,
);

const isError = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const handleSubmit = async () => {
  isLoading.value = true;

  const saved = await saveSettings({
    ...form,
    currency: form.currency.code,
  });

  if (!saved) {
    isError.value = true;
    isLoading.value = false;
    return;
  }

  router.push({ name: 'main' });
};
</script>

<template>
  <BaseLayout>
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
          :model-value="Object.keys(form.spendingCategories)"
          placeholder="Food"
          label="Spending categories"
          name="spendingCategories"
          empty-text="Add at least one spending category"
          max-height="20vh"
          @on-add="(value) => (form.spendingCategories[value] = '')"
          @on-delete="(value) => delete form.spendingCategories[value]"
        />
        <EditableList
          :model-value="Object.keys(form.incomeCategories)"
          placeholder="Salary"
          label="Income categories"
          name="incomeCategories"
          empty-text="Add at least one income category"
          max-height="20vh"
          @on-add="(value) => (form.incomeCategories[value] = '')"
          @on-delete="(value) => delete form.incomeCategories[value]"
        />

        <BaseButton :disabled="isContinueDisabled || isLoading" class="mt-4">Continue</BaseButton>

        <div v-if="isError" class="text-red-primary">Something went wrong, try again...</div>
      </WrapperContainer>
    </form>
  </BaseLayout>
</template>
