import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { TransactionTypes, type Transaction, type TransactionFormData } from '../types/finances';
import { dateToHumanReadable, isCurrentMonth } from '../utils/date';
import {
  formDataToTransaction,
  removeTransactionsFromPending,
  saveTransactionsToSpreadsheet,
} from '../services/transactions';
import { CURRENCIES, type Currency } from '../constants/currencies';

export const useFinanceStore = defineStore(
  'finances',
  () => {
    const transactions = ref<Transaction[]>([]);
    const pendingTransactions = ref<string[]>([]);
    const categories = ref<string[]>([]); // Example categories
    const currency = ref<Currency>(CURRENCIES[0]);

    const addTransaction = async (transaction: TransactionFormData) => {
      const transactionData = formDataToTransaction(transaction);

      if (!transactionData) return;

      const transactionId = crypto.randomUUID();
      const transactionToPush = { ...transactionData, id: transactionId };
      transactions.value.unshift(transactionToPush);
      pendingTransactions.value.push(transactionId);

      const result = await saveTransactionsToSpreadsheet([transactionToPush]);

      if (result) removeTransactionsFromPending(transactionId);
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
      pendingTransactions,
    };
  },
  {
    persist: true,
  },
);
