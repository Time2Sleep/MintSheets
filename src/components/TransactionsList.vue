<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFinanceStore } from '../stores/finances';
import TransactionItem from './UI/TransactionItem.vue';
import WrapperContainer from './UI/WrapperContainer.vue';
import { onMounted, computed, ref } from 'vue';

const financeStore = useFinanceStore();
const { allTransactionsGrouped, currency } = storeToRefs(financeStore);

const props = defineProps<{
  offset: number;
}>();

const emits = defineEmits<{
  (e: 'expand', expanded: boolean): void;
}>();

const isExpanded = ref(false);
const content = ref<HTMLElement | null>(null);
const contentHeight = ref(0);
const isReady = ref(false);

const style = computed(() => {
  const SWIPE_HANDLE_HEIGHT = 40; //высота полоски для свайпа, которая находится сверху

  if (!props.offset) {
    return {
      transform: `translateY(calc(100vh - ${SWIPE_HANDLE_HEIGHT}px))`,
    };
  }

  if (isExpanded.value) {
    return {
      transform: `translateY(0px)`,
    };
  }

  const offset = contentHeight.value + props.offset;

  return {
    transform: `translateY(calc(${offset}px - 100vh)`,
  };
});

const scrollableContainer = ref<HTMLElement | null>(null);

const handleExpand = () => {
  isExpanded.value = true;
  emits('expand', isExpanded.value);
};

const handleCollapse = () => {
  isExpanded.value = false;
  scrollableContainer.value?.scrollTo({ top: 0, behavior: 'smooth' });
  emits('expand', isExpanded.value);
};

onMounted(() => {
  contentHeight.value = content.value?.offsetHeight || 0;

  setTimeout(() => {
    isReady.value = true;
  }, 50);
});
</script>

<template>
  <div
    ref="content"
    v-swipe-up="handleExpand"
    v-swipe-down="handleCollapse"
    class="absolute bottom-0 z-10 left-0 w-full px-4"
    :class="{ 'transition-transform duration-300 ease-in-out': isReady }"
    :style="style"
  >
    <WrapperContainer class="flex-1 h-[calc(100dvh-200px)] rounded-br-none rounded-bl-none pt-0">
      <div v-swipe-down="handleCollapse" class="py-4">
        <div class="h-[5px] min-h-[5px] mx-auto rounded bg-light-secondary w-[50px]"></div>
      </div>

      <p v-if="!Object.keys(allTransactionsGrouped).length" class="text-light-secondary">No transactions yet</p>

      <ul
        v-else
        ref="scrollableContainer"
        class="flex flex-col gap-4"
        :class="{ 'overflow-hidden': !isExpanded, 'overflow-y-auto': isExpanded }"
      >
        <li v-for="(data, key) in allTransactionsGrouped" :key="key" class="block text-sm pb-2">
          <TransactionItem :title="key" :data="data" :currency="currency" />
        </li>
      </ul>
    </WrapperContainer>
  </div>
</template>
