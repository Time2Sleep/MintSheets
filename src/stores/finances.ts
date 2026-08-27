import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { TransactionTypes, type Transaction, type TransactionWithoutId } from '../types/finances';
import { isCurrentMonth } from '../utils/date';

export const useFinanceStore = defineStore('finances', () => {
  const transactions = ref<Transaction[]>([]);
  const categories = ref<string[]>(['Food', 'Transport', 'Salary', 'Utilities']); // Example categories

  const addTransaction = (transaction: TransactionWithoutId) => {
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

  const transactionsReversed = computed<Transaction[]>(() => {
    return [...transactions.value].reverse();
  });

  return {
    categories,
    monthIncome,
    monthSpending,
    addTransaction,
    transactionsReversed,
  };
});
