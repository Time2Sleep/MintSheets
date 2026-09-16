import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  TransactionTypes,
  type SpreadsheetSettingsFormData,
  type Transaction,
  type TransactionFormData,
} from '../types/finances';
import { dateToHumanReadable, isCurrentMonth } from '../utils/date';
import {
  formDataToTransaction,
  removeTransactionsFromPending,
  saveTransactionsToSpreadsheet,
} from '../services/transactions';
import { CURRENCIES, type Currency } from '../constants/currencies';
import { fetchSettingsFromSpreadsheet, saveSettingsToSpreadsheet } from '../services/settings';
import { useGoogleStore } from './google';
import { getCurrencyByCode } from '../utils/currency';

export const useFinanceStore = defineStore(
  'finances',
  () => {
    const initialBalance = ref<number>(0);
    const transactions = ref<Transaction[]>([]);
    const pendingTransactions = ref<string[]>([]);
    const spendingCategories = ref<string[]>([]);
    const incomeCategories = ref<string[]>([]);
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

    const getSettings = async (spreadsheetId: string) => {
      const settings = await fetchSettingsFromSpreadsheet(spreadsheetId);

      if (!settings) return;

      initialBalance.value = settings.balance;
      currency.value = settings.currency;
      spendingCategories.value = settings.spendingCategories;
      incomeCategories.value = settings.incomeCategories;
    };

    const saveSettings = async (settings: SpreadsheetSettingsFormData): Promise<boolean> => {
      const googleStore = useGoogleStore();

      if (!googleStore.spreadsheetId || googleStore.sheetsId.total == null) {
        return false;
      }

      try {
        await saveSettingsToSpreadsheet(googleStore.spreadsheetId, googleStore.sheetsId.total, settings);

        initialBalance.value = Number(settings.balance);
        currency.value = getCurrencyByCode(settings.currency) || CURRENCIES[0];
        spendingCategories.value = settings.spendingCategories;
        incomeCategories.value = settings.incomeCategories;

        return true;
      } catch (error) {
        console.warn('[Finance Store] Failed to save settings:', error);
        return false;
      }
    };

    return {
      initialBalance,
      spendingCategories,
      incomeCategories,
      transactions,
      monthIncome,
      monthSpending,
      addTransaction,
      allTransactionsGrouped,
      currency,
      pendingTransactions,
      getSettings,
      saveSettings,
    };
  },
  {
    persist: true,
  },
);
