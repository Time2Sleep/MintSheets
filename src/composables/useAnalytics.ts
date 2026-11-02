import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useCurrentFinanceStore } from '../stores/financeStoreRegistry';
import { TransactionTypes, type Transaction, type TransactionType } from '../types/finances';
import { dateToHumanReadable } from '../utils/date';

const getChartColor = (index: number) => `hsl(${(index * 137.508) % 360} 68% 60%)`;

export const useAnalytics = () => {
  const currentDate = new Date();
  const year = ref(currentDate.getFullYear());
  const month = ref(currentDate.getMonth());
  const transactionType = ref<TransactionType>(TransactionTypes.SPENDING);
  const store = useCurrentFinanceStore();
  const { transactions, pendingTransactions } = storeToRefs(store);

  const monthTransactions = computed(() => {
    const monthKey = `${year.value}-${String(month.value + 1).padStart(2, '0')}`;

    return [...pendingTransactions.value, ...transactions.value]
      .filter((transaction) => transaction.date.startsWith(monthKey) && transaction.type === transactionType.value)
      .sort((a, b) => b.date.localeCompare(a.date));
  });

  const categoryBreakdown = computed(() => {
    const totals = new Map<string, number>();

    for (const transaction of monthTransactions.value) {
      totals.set(transaction.category, (totals.get(transaction.category) || 0) + transaction.amount);
    }

    return [...totals.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .map((category, index) => ({
        ...category,
        color: getChartColor(index),
      }));
  });

  const total = computed(() => categoryBreakdown.value.reduce((sum, category) => sum + category.amount, 0));

  const chartData = computed(() => ({
    labels: categoryBreakdown.value.map(({ category }) => category),
    datasets: [
      {
        backgroundColor: categoryBreakdown.value.map(({ color }) => color),
        data: categoryBreakdown.value.map(({ amount }) => amount),
        cutout: '70%',
      },
    ],
  }));

  const groupedTransactions = computed(() =>
    monthTransactions.value.reduce(
      (groups, transaction) => {
        const title = dateToHumanReadable(transaction.date);
        (groups[title] ||= []).push(transaction);
        return groups;
      },
      {} as Record<string, Transaction[]>,
    ),
  );

  const changeMonth = (amount: number) => {
    const nextMonth = new Date(year.value, month.value + amount, 1);
    year.value = nextMonth.getFullYear();
    month.value = nextMonth.getMonth();
  };

  return {
    year,
    month,
    transactionType,
    monthTransactions,
    categoryBreakdown,
    total,
    chartData,
    groupedTransactions,
    changeMonth,
  };
};
