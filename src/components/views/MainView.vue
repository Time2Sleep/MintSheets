<script setup lang="ts">
import TransactionForm from '../TransactionForm.vue';
import FinanceCard from '../UI/FinanceCard.vue';
import BaseIcon from '../UI/BaseIcon.vue';
import WrapperContainer from '../UI/WrapperContainer.vue';
import { storeToRefs } from 'pinia';
import TransactionsList from '../TransactionsList.vue';
import { onMounted, ref } from 'vue';
import { useGoogleStore } from '../../stores/google';
import { useCurrentFinanceStore } from '../../stores/financeStoreRegistry';
import { SessionStatus } from '../../types/auth';

const googleStore = useGoogleStore();
const { sessionStatus, userInfo } = storeToRefs(googleStore);

const financeStore = useCurrentFinanceStore();
const { monthSpending, monthIncome, currency } = storeToRefs(financeStore);

const content = ref<HTMLElement | null>(null);

const offsetHeight = ref(0);

const bottomSheetExpanded = ref(false);

onMounted(() => {
  offsetHeight.value = content.value?.offsetHeight || 0;
});
</script>

<template>
  <div ref="content">
    <div class="flex gap-4 items-center pb-3 pt-4">
      <h1 class="text-xl">Hello, {{ userInfo?.given_name || 'User' }}!</h1>

      <BaseIcon
        v-if="sessionStatus === SessionStatus.RESTORING"
        icon="arrow-clockwise"
        class="animate-spin"
        role="status"
      />

      <div class="ml-auto flex gap-1 items-center">
        <p
          v-if="sessionStatus === SessionStatus.OFFLINE"
          class="rounded-xl bg-red-secondary text-red-primary px-3 mr-2"
        >
          Offline
        </p>
        <RouterLink to="/settings" aria-label="Settings">
          <BaseIcon icon="gear" />
        </RouterLink>
      </div>
    </div>

    <RouterLink to="analytics" class="flex gap-3 mb-3">
      <FinanceCard
        class="flex-1"
        title="Spending"
        :value="monthSpending"
        bar-color-class="bg-red-primary"
        :currency="currency"
      />

      <FinanceCard
        class="flex-1"
        title="Income"
        :value="monthIncome"
        bar-color-class="bg-mint-primary"
        :currency="currency"
      />
    </RouterLink>

    <WrapperContainer
      :gap="3"
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
