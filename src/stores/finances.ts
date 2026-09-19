import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  TransactionTypes,
  type SpreadsheetSettingsFormData,
  type Transaction,
  type TransactionFormData,
} from '../types/finances';
import type { SpreadsheetContext } from '../types/api';
import { dateToHumanReadable, isCurrentMonth } from '../utils/date';
import {
  formDataToTransaction,
  getTransactionsFromSpreadsheet,
  saveTransactionsToSpreadsheet,
  syncTransactions,
} from '../services/transactions';
import { fetchSettingsFromSpreadsheet, saveSettingsToSpreadsheet } from '../services/settings';
import { CURRENCIES, type Currency } from '../constants/currencies';
import { getCurrencyByCode } from '../utils/currency';

export const createFinanceStore = (initialContext: SpreadsheetContext) =>
  defineStore(
    `finance_${initialContext.spreadsheetId}`,
    () => {
      let context = initialContext;
      const initialBalance = ref<number>(0);
      const transactions = ref<Transaction[]>([]);
      const pendingTransactions = ref<Transaction[]>([]);
      const spendingCategories = ref<string[]>([]);
      const incomeCategories = ref<string[]>([]);
      const currency = ref<Currency>(CURRENCIES[0]);

      const updateContext = (newContext: SpreadsheetContext) => {
        context = newContext;
      };

      const addTransaction = async (transaction: TransactionFormData) => {
        const transactionData = formDataToTransaction(transaction);

        if (!transactionData) return;

        const transactionId = crypto.randomUUID();
        const transactionToPush = { ...transactionData, id: transactionId };
        pendingTransactions.value.unshift({ ...transactionToPush, pending: true });

        try {
          await saveTransactionsToSpreadsheet(context, [transactionToPush]);
          _setTransactionsConfirmed([transactionId]);
        } catch (error) {
          console.warn('[Finance Store] failed to send transaction to spreadsheet.', error);
        }
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

      const allTransactionsSorted = computed<Transaction[]>(() => {
        return [...pendingTransactions.value, ...transactions.value].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
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
        return groupTransactions(allTransactionsSorted.value);
      });

      const getSettings = async () => {
        const settings = await fetchSettingsFromSpreadsheet(context);

        if (!settings) return;

        initialBalance.value = settings.balance;
        currency.value = settings.currency;
        spendingCategories.value = settings.spendingCategories;
        incomeCategories.value = settings.incomeCategories;
      };

      const saveSettings = async (settings: SpreadsheetSettingsFormData): Promise<boolean> => {
        try {
          await saveSettingsToSpreadsheet(context, settings);

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

      const syncLocalTransactions = async () => {
        try {
          await getTransactions();
          const { syncedIds, unsyncedIds } = await syncTransactions(
            context,
            transactions.value,
            pendingTransactions.value,
          );

          if (unsyncedIds.length) console.log('[Finance Store]: Failed to sync transactions with IDs:', unsyncedIds);

          _setTransactionsConfirmed(syncedIds);
        } catch (error) {
          console.warn('[Finance Store]: Failed to sync transactions.', error);
        }
      };

      const getTransactions = async () => {
        try {
          transactions.value = await getTransactionsFromSpreadsheet(context);
        } catch (error) {
          console.warn('[Finance Store]: Failed to recieve transactions.', error);

          throw error;
        }
      };

      const _setTransactionsConfirmed = (transactionIDs: string[]) => {
        if (!transactionIDs.length) return;

        const existingIds = new Set(transactions.value.map(({ id }) => id));
        const confirmedTransactions = pendingTransactions.value
          .filter(({ id }) => transactionIDs.includes(id))
          .filter(({ id }) => !existingIds.has(id))
          .map((transaction) => ({ ...transaction, pending: false }));

        pendingTransactions.value = pendingTransactions.value.filter(({ id }) => !transactionIDs.includes(id));

        transactions.value.unshift(...confirmedTransactions);
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
        syncLocalTransactions,
        getTransactions,
        updateContext,
      };
    },
    {
      persist: true,
    },
  );
