import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { TransactionTypes, type Transaction, type TransactionWithoutId } from '../types/finances';
import { dateToHumanReadable, isCurrentMonth } from '../utils/date';

export const useFinanceStore = defineStore(
  'finances',
  () => {
    const transactions = ref<Transaction[]>([]);
    const categories = ref<string[]>(['Food', 'Transport', 'Salary', 'Utilities']); // Example categories
    const currency = ref<string>('₽');

    const addTransaction = (transaction: TransactionWithoutId) => {
      if (!Number.isFinite(Number(transaction.amount))) return;

      transactions.value.push({ ...transaction, id: crypto.randomUUID(), amount: Number(transaction.amount) });
    };

    const monthIncome = computed<number>(() => {
      return transactions.value
        .filter((transaction) => transaction.type === TransactionTypes.INCOME && isCurrentMonth(transaction.date))
        .reduce((total, transaction) => total + transaction.amount, 0);
    });

    const monthSpending = computed<number>(() => {
      return transactions.value
        .filter((transaction) => transaction.type === TransactionTypes.SPENDING && isCurrentMonth(transaction.date))
        .reduce((total, transaction) => total + transaction.amount, 0);
    });

    const transactionsSorted = computed<Transaction[]>(() => {
      return [...transactions.value].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    const groupTransactions = (list: Transaction[]): Record<string, Transaction[]> => {
      return list.reduce(
        (acc, cur) => {
          const date = dateToHumanReadable(cur.date);
          if (!acc[date]) {
            acc[date] = [];
          }
          acc[date].push(cur);
          return acc;
        },
        {} as Record<string, Transaction[]>,
      );
    };

    const allTransactionsGrouped = computed(() => {
      return groupTransactions(transactionsSorted.value);
    });

    return {
      categories,
      transactions,
      monthIncome,
      monthSpending,
      addTransaction,
      allTransactionsGrouped,
      currency,
    };
  },
  {
    persist: true,
  },
);
