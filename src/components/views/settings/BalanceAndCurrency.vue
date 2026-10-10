<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCurrentFinanceStore } from '../../../stores/financeStoreRegistry';
import BaseInput from '../../UI/BaseInput.vue';
import { computed, reactive } from 'vue';
import BaseSelect from '../../UI/BaseSelect.vue';
import { CURRENCIES } from '../../../constants/currencies';
import WrapperContainer from '../../UI/WrapperContainer.vue';
import BaseButton from '../../UI/BaseButton.vue';
import BaseLayout from '../../BaseLayout.vue';
import { useAsyncAction } from '../../../composables/useAsyncAction';

const financeStore = useCurrentFinanceStore();
const { currency, initialBalance } = storeToRefs(financeStore);

const form = reactive({
  currency: { ...currency.value },
  balance: initialBalance.value.toString(),
});

const { isError, isLoading, isSuccess, execute, clearState } = useAsyncAction();

const handleSave = async () => {
  await execute(() => financeStore.saveBalanceAndCurrency(Number(form.balance), form.currency));
};

const isSaveDisabled = computed(() => form.balance === '' || isLoading.value);
</script>
<template>
  <BaseLayout hide-title>
    <WrapperContainer :gap="4">
      <BaseInput
        v-model.number="form.balance"
        name="balance"
        placeholder="100 000"
        type="number"
        label="Initial balance"
        @change="clearState"
      />

      <BaseSelect
        v-model="form.currency"
        name="currency"
        label="Currency"
        :options="CURRENCIES"
        label-key="name"
        @change="clearState"
      />
    </WrapperContainer>

    <div class="mt-auto w-full">
      <div v-if="isError" class="text-red-primary mb-2">Something went wrong, try again.</div>
      <div v-if="isSuccess" class="text-green-primary mb-2">Saved successfully.</div>

      <BaseButton class="w-full" :disabled="isSaveDisabled" @click="handleSave">
        {{ isLoading ? 'Saving...' : 'Save' }}
      </BaseButton>
    </div>
  </BaseLayout>
</template>
