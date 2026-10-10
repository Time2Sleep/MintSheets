<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCurrentFinanceStore } from '../../../stores/financeStoreRegistry';
import BaseInput from '../../UI/BaseInput.vue';
import { reactive, ref } from 'vue';
import BaseSelect from '../../UI/BaseSelect.vue';
import { CURRENCIES } from '../../../constants/currencies';
import WrapperContainer from '../../UI/WrapperContainer.vue';
import BaseButton from '../../UI/BaseButton.vue';
import BaseLayout from '../../BaseLayout.vue';

const financeStore = useCurrentFinanceStore();
const { currency, initialBalance } = storeToRefs(financeStore);

const form = reactive({
  currency,
  balance: initialBalance,
});

const isLoading = ref(false);
const isError = ref(false);
const handleSubmit = async () => {
  isLoading.value = true;
  isError.value = false;
  try {
    await financeStore.saveBalanceAndCurrency(Number(form.balance), form.currency);
  } catch (error) {
    console.warn('Failed to save balance and currency', error);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};
</script>
<template>
  <BaseLayout hide-title>
    <form @submit.prevent="handleSubmit">
      <WrapperContainer :gap="4">
        <BaseInput
          v-model.number="form.balance"
          name="balance"
          placeholder="100 000"
          type="number"
          label="Initial balance"
        />

        <BaseSelect v-model="form.currency" name="currency" label="Currency" :options="CURRENCIES" label-key="name" />
      </WrapperContainer>

      <BaseButton class="w-full mt-4">Save</BaseButton>
    </form>
  </BaseLayout>
</template>
