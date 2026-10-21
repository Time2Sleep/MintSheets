<script setup lang="ts">
import { storeToRefs } from 'pinia';
import TransactionItem from './UI/TransactionItem.vue';
import WrapperContainer from './UI/WrapperContainer.vue';
import TransactionEditModal from './modals/TransactionEditModal.vue';
import { useCurrentFinanceStore } from '../stores/financeStoreRegistry';
import { type Transaction } from '../types/finances';
import { useAsyncAction } from '../composables/useAsyncAction';
import LoadingSpinner from './UI/LoadingSpinner.vue';
import { computed, ref } from 'vue';

const financeStore = useCurrentFinanceStore();
const { allTransactionsGrouped, currency, transactionsLoading } = storeToRefs(financeStore);

const props = defineProps<{
  offset: number;
}>();

const emits = defineEmits<{
  (e: 'swipe-up'): void;
  (e: 'swipe-down'): void;
}>();

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

const scrollableContainer = ref<HTMLElement>();
const isScrollEnabled = ref(false);
const listStyle = computed(() => (isScrollEnabled.value ? { transform: `translateY(-${props.offset}px)` } : ''));

const handleUp = () => {
  emits('swipe-up');
  isScrollEnabled.value = true;
};

const handleDown = () => {
  emits('swipe-down');
  scrollableContainer.value?.scrollTo({ top: 0, behavior: 'smooth' });
  isScrollEnabled.value = false;
};

const checkScroll = () => {
  if (!scrollableContainer.value || scrollableContainer.value.scrollTop !== 0) return;

  handleDown();
};
</script>

<template>
  <div v-swipe-up="handleUp" v-swipe-down="checkScroll" class="transition-all" :style="listStyle">
    <WrapperContainer class="flex-1 h-[calc(100dvh-180px)] rounded-br-none rounded-bl-none pt-0">
      <div v-swipe-down="handleDown" class="py-4">
        <div class="h-[5px] min-h-[5px] mx-auto rounded bg-light-secondary w-[50px]"></div>
      </div>

      <LoadingSpinner v-if="transactionsLoading" />

      <p v-if="!Object.keys(allTransactionsGrouped).length" class="text-light-secondary">No transactions yet</p>

      <ul
        v-else
        ref="scrollableContainer"
        class="flex flex-col gap-4 overscroll-y-contain"
        :class="{ 'overflow-hidden': !isScrollEnabled, 'overflow-y-auto': isScrollEnabled }"
      >
        <li v-for="(data, key) in allTransactionsGrouped" :key="key" class="block text-sm pb-2">
          <TransactionItem :title="key" :data="data" :currency="currency.symbol" @transaction-click="openModal" />
        </li>
      </ul>
    </WrapperContainer>
  </div>

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
