<script setup lang="ts">
import TransactionForm from '../TransactionForm.vue';
import FinanceCard from '../UI/FinanceCard.vue';
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
    <div class="flex justify-between items-center pb-3 pt-4">
      <h1 class="text-xl">Hello, {{ userInfo?.given_name || 'User' }}!</h1>

      <div class="flex gap-1 items-center">
        <p
          v-if="sessionStatus === SessionStatus.OFFLINE"
          class="rounded-xl bg-red-secondary text-red-primary px-3 mr-2"
        >
          Offline
        </p>
        <RouterLink to="/settings">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 16 16"
            style="width: 20px; height: 20px"
          >
            <path
              d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"
            />
          </svg>
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
