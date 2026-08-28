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

    const transactionsFormatted = computed<Record<string, Transaction[]>>(() => {
      return transactions.value
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .reduce(
          (acc, cur) => {
            const date = dateToHumanReadable(cur.date);
            const existingField = acc[date];

            if (existingField) {
              acc[date].push(cur);
            } else {
              acc[date] = [cur];
            }

            return acc;
          },
          {} as Record<string, Transaction[]>,
        );
    });

    return {
      categories,
      transactions,
      monthIncome,
      monthSpending,
      addTransaction,
      transactionsFormatted,
      currency,
    };
  },
  {
    persist: true,
  },
);
