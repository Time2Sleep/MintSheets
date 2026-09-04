<script setup lang="ts">
import TransactionForm from '../TransactionForm.vue';
import FinanceCard from '../UI/FinanceCard.vue';
import WrapperContainer from '../UI/WrapperContainer.vue';
import { useFinanceStore } from '../../stores/finances';
import { storeToRefs } from 'pinia';
import TransactionsList from '../TransactionsList.vue';
import { onMounted, ref } from 'vue';
import { useGoogleStore } from '../../stores/google';

const financeStore = useFinanceStore();
const { monthSpending, monthIncome, currency } = storeToRefs(financeStore);

const googleStore = useGoogleStore();
const { isOffline } = storeToRefs(googleStore);

const content = ref<HTMLElement | null>(null);

const offsetHeight = ref(0);

const bottomSheetExpanded = ref(false);

onMounted(() => {
  offsetHeight.value = content.value?.offsetHeight || 0;
});
</script>

<template>
  <div ref="content">
    <div class="flex justify-between items-center pb-4 pt-6">
      <h1 class="text-2xl">Hello, User!</h1>

      <p v-if="isOffline" class="rounded-xl bg-red-secondary text-red-primary px-4">Offline</p>
    </div>

    <RouterLink to="analytics" class="flex gap-4 mb-4">
      <FinanceCard
        class="flex-1"
        title="Spending"
        :value="monthSpending"
        bar-color-class="bg-red-primary"
        :postfix="currency"
      />

      <FinanceCard
        class="flex-1"
        title="Income"
        :value="monthIncome"
        bar-color-class="bg-mint-primary"
        :postfix="currency"
      />
    </RouterLink>

    <WrapperContainer
      :gap="4"
      class="mb-4 transition-opacity duration-300 ease-in-out"
      :class="{ 'opacity-0': bottomSheetExpanded }"
    >
      <TransactionForm />
    </WrapperContainer>
  </div>

  <TransactionsList
    v-if="offsetHeight"
    :offset="offsetHeight"
    @expand="(expanded) => (bottomSheetExpanded = expanded)"
  />
</template>
