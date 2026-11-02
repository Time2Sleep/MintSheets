<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import BaseLayout from '../BaseLayout.vue';
import BaseButton from '../UI/BaseButton.vue';
import TransactionItem from '../UI/TransactionItem.vue';
import TransactionEditModal from '../modals/TransactionEditModal.vue';
import { MONTHS } from '../../utils/date';
import { useAnalytics } from '../../composables/useAnalytics';
import { useCurrentFinanceStore } from '../../stores/financeStoreRegistry';
import { useAsyncAction } from '../../composables/useAsyncAction';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { TransactionTypes, type Transaction } from '../../types/finances';

ChartJS.register(ArcElement, Tooltip, Legend);

const financeStore = useCurrentFinanceStore();
const route = useRoute();
const { currency } = storeToRefs(financeStore);
const { year, month, transactionType, categoryBreakdown, total, chartData, groupedTransactions, changeMonth } =
  useAnalytics();

watch(
  () => route.query.type,
  (type) => {
    if (type === TransactionTypes.INCOME || type === TransactionTypes.SPENDING) {
      transactionType.value = type;
    }
  },
  { immediate: true },
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  borderColor: 'transparent',
  radius: '80%',
  devicePixelRatio: window.devicePixelRatio || 1,
  plugins: {
    legend: {
      display: false,
    },
  },
};

const chartPointerStart = ref<{ x: number; y: number }>();
const handleChartPointerDown = (event: PointerEvent) => {
  if (!event.isPrimary) return;

  chartPointerStart.value = { x: event.clientX, y: event.clientY };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
};
const handleChartPointerUp = (event: PointerEvent) => {
  if (chartPointerStart.value === undefined) return;

  const distanceX = event.clientX - chartPointerStart.value.x;
  const distanceY = event.clientY - chartPointerStart.value.y;
  chartPointerStart.value = undefined;

  if (Math.abs(distanceX) < 40 || Math.abs(distanceX) <= Math.abs(distanceY)) return;
  if (distanceX > 0) changeMonth(-1);
  if (distanceX < 0) changeMonth(1);
};

const modalTransaction = ref<Transaction>();
const openModal = (transaction: Transaction) => {
  modalTransaction.value = transaction;
};

const { isLoading, isSuccess, isError, execute, clearState } = useAsyncAction();

const handleEdit = async (transaction: Transaction) => {
  await execute(() => financeStore.updateTransaction(transaction));
};

const handleDelete = async (transaction: Transaction) => {
  await execute(() => financeStore.deleteTransaction(transaction), { noSuccess: true });

  if (isError.value) return;

  modalTransaction.value = undefined;
  clearState();
};
</script>

<template>
  <BaseLayout class="!gap-0">
    <div class="flex items-center justify-between bg-dark-primary">
      <button
        type="button"
        class="h-8 w-8 rounded-full text-2xl text-light-secondary active:bg-dark-secondary"
        aria-label="Previous month"
        @click="changeMonth(-1)"
      >
        ‹
      </button>
      <div class="text-center">{{ MONTHS[month] }} {{ year }}</div>
      <button
        type="button"
        class="h-8 w-8 rounded-full text-2xl text-light-secondary active:bg-dark-secondary"
        aria-label="Next month"
        @click="changeMonth(1)"
      >
        ›
      </button>
    </div>

    <div class="flex flex-col flex-1 min-h-0 gap-4 overflow-y-auto">
      <div
        class="relative h-[200px] shrink-0 chart-container touch-pan-y"
        @pointerdown="handleChartPointerDown"
        @pointerup="handleChartPointerUp"
        @pointercancel="chartPointerStart = undefined"
      >
        <Doughnut :data="chartData" :options="chartOptions" />

        <div
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-xl pointer-events-none"
        >
          {{ total.toLocaleString() }} {{ currency.symbol }}
        </div>
      </div>

      <div class="flex gap-4">
        <BaseButton class="flex-1 !py-1" :active="transactionType === 'spending'" @click="transactionType = 'spending'">
          Spending
        </BaseButton>
        <BaseButton class="flex-1 !py-1" :active="transactionType === 'income'" @click="transactionType = 'income'">
          Income
        </BaseButton>
      </div>

      <div v-if="categoryBreakdown.length" class="flex flex-wrap gap-2">
        <div
          v-for="category in categoryBreakdown"
          :key="category.category"
          class="flex items-center gap-2 rounded-full bg-dark-secondary px-3 py-1 text-sm"
        >
          <span
            class="h-3 w-3 shrink-0 rounded-full"
            :style="{ backgroundColor: category.color }"
            aria-hidden="true"
          ></span>
          <span>{{ category.category }}</span>
          <span class="whitespace-nowrap">{{ category.amount.toLocaleString() }} {{ currency.symbol }}</span>
        </div>
      </div>

      <p v-else class="text-light-secondary">No transactions for this month</p>

      <ul v-if="Object.keys(groupedTransactions).length" class="flex flex-col gap-4 min-h-0">
        <li v-for="(data, title) in groupedTransactions" :key="title" class="block text-sm pb-2">
          <TransactionItem :title="title" :data="data" :currency="currency.symbol" @transaction-click="openModal" />
        </li>
      </ul>
    </div>
  </BaseLayout>

  <TransactionEditModal
    v-model:transaction="modalTransaction"
    :loading="isLoading"
    @submit="handleEdit"
    @close="clearState"
    @delete="handleDelete"
  >
    <div v-if="isError" class="text-red-primary">Something went wrong...</div>
    <div v-if="isSuccess" class="text-green-primary">Saved successfully</div>
  </TransactionEditModal>
</template>
