import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  TransactionTypes,
  type Categories,
  type SpreadsheetSettingsFormData,
  type Transaction,
  type TransactionFormData,
  type TransactionType,
} from '../types/finances';
import type { SpreadsheetContext } from '../types/spreadsheet';
import { dateToHumanReadable, isCurrentMonth } from '../utils/date';
import {
  changeTransactionInSpreadsheet,
  formDataToTransaction,
  getTransactionsFromSpreadsheet,
  saveTransactionsToSpreadsheet,
  syncTransactions,
} from '../services/transactions';
import {
  fetchSettingsFromSpreadsheet,
  saveBalanceToSpreadsheet,
  saveCategoriesToSpreadsheet,
  saveSettingsToSpreadsheet,
} from '../services/settings';
import { CURRENCIES, type Currency } from '../constants/currencies';
import { getCurrencyByCode } from '../utils/currency';
import { deleteYearTabFromSpreadsheet, initYearTab } from '../services/annual';
import { addYearToAnalyticsTab, getAnalyticsData } from '../services/analytics/sheet';
import { createSerializedTaskRunner } from '../utils/async';
import { deleteRowsFromSpreadsheet } from '../services/tabs';
import { SPREADSHEET_SCHEMA } from '../schemas/spreadsheet';
import { message } from 'vue-message-popup';

export const createFinanceStore = (initialContext: SpreadsheetContext) =>
  defineStore(
    `finance_${initialContext.spreadsheetId}`,
    () => {
      let context = initialContext;
      const initialBalance = ref<number>(0);
      const transactions = ref<Transaction[]>([]);
      const pendingTransactions = ref<Transaction[]>([]);
      const categories = ref<Categories>({ spending: {}, income: {} });
      const currency = ref<Currency>(CURRENCIES[0]);
      const analyticsData = ref<Record<number, number>>({});
      const analyticsWriteRunner = createSerializedTaskRunner();
      const transactionRowsWriteRunner = createSerializedTaskRunner();
      const transactionsLoading = ref(true);
      const spendingCategoriesTitles = computed<string[]>(() => Object.keys(categories.value.spending));
      const incomeCategoriesTitles = computed<string[]>(() => Object.keys(categories.value.income));

      const updateContext = (newContext: SpreadsheetContext) => {
        context = newContext;
      };

      const addTransaction = async (transaction: TransactionFormData) => {
        const transactionData = formDataToTransaction(transaction);

        if (!transactionData) return;

        const transactionId = crypto.randomUUID();
        const transactionToPush = { ...transactionData, id: transactionId };

        try {
          await transactionRowsWriteRunner.run(null, async () => {
            pendingTransactions.value.unshift({ ...transactionToPush, pending: true });
            await saveTransactionsToSpreadsheet(context, [transactionToPush]);
            _setTransactionsConfirmed([transactionId]);
          });
        } catch (error) {
          console.warn('[Finance Store] failed to send transaction to spreadsheet.', error);
        }

        const year = transactionData.date.slice(0, 4);
        await checkYearExistanceInSpreadsheet(year);
      };

      const checkYearExistanceInSpreadsheet = async (year: string) => {
        if (!(year in context.sheets)) await buildYearTab(year);

        await checkAnalytics(year);
      };

      const checkAnalytics = async (year: string) => {
        await analyticsWriteRunner.run(year, async () => {
          const analyticYears = Object.keys(analyticsData.value);

          if (analyticYears.includes(year)) return;

          const result = await addYearToAnalyticsTab(context, year, analyticYears.length);

          if (!result) return;

          analyticsData.value = { ...analyticsData.value, [year]: 0 };
          await getAnalyticsYears();
        });
      };

      const buildYearTab = async (year: string) => {
        const yearTabId = await initYearTab(context.spreadsheetId, year, categories.value);

        if (!yearTabId) return;

        updateContext({
          ...context,
          sheets: {
            ...context.sheets,
            [year]: yearTabId,
          },
        });
      };

      const allTransactionsSorted = computed<Transaction[]>(() => {
        return [...pendingTransactions.value, ...transactions.value].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      });

      const transactionsCount = computed<number>(() => transactions.value.length);

      const monthIncome = computed<number>(() => {
        return allTransactionsSorted.value
          .filter((transaction) => transaction.type === TransactionTypes.INCOME && isCurrentMonth(transaction.date))
          .reduce((total, transaction) => total + transaction.amount, 0);
      });

      const monthSpending = computed<number>(() => {
        return allTransactionsSorted.value
          .filter((transaction) => transaction.type === TransactionTypes.SPENDING && isCurrentMonth(transaction.date))
          .reduce((total, transaction) => total + transaction.amount, 0);
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

      const getAnalyticsYears = async () => {
        const data = await getAnalyticsData(context);
        analyticsData.value = data;
      };

      const getSettings = async () => {
        const settings = await fetchSettingsFromSpreadsheet(context);

        if (!settings) return;

        initialBalance.value = settings.balance;
        currency.value = settings.currency;
        categories.value = settings.categories;
      };

      const saveSettings = async (settings: SpreadsheetSettingsFormData): Promise<boolean> => {
        try {
          await saveSettingsToSpreadsheet(context, settings);

          initialBalance.value = Number(settings.balance);
          currency.value = getCurrencyByCode(settings.currency) || CURRENCIES[0];
          categories.value = {
            spending: settings.spendingCategories,
            income: settings.incomeCategories,
          };

          return true;
        } catch (error) {
          console.warn('[Finance Store] Failed to save settings:', error);
          return false;
        }
      };

      const syncLocalTransactions = async () => {
        try {
          await transactionRowsWriteRunner.run(null, async () => {
            await getTransactions();
            const { syncedIds, unsyncedIds } = await syncTransactions(
              context,
              transactions.value,
              pendingTransactions.value,
            );

            if (unsyncedIds.length) {
              console.log('[Finance Store]: Failed to sync transactions with IDs:', unsyncedIds);
            }

            _setTransactionsConfirmed(syncedIds);
          });
        } catch (error) {
          console.warn('[Finance Store]: Failed to sync transactions.', error);

          message.error('Transactions sync failed');
        }
      };

      const getTransactions = async () => {
        transactionsLoading.value = true;

        try {
          transactions.value = await getTransactionsFromSpreadsheet(context);
        } catch (error) {
          console.warn('[Finance Store]: Failed to recieve transactions.', error);

          throw error;
        } finally {
          transactionsLoading.value = false;
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

      const saveBalanceAndCurrency = async (balance: number, newCurrency: Currency) => {
        await saveBalanceToSpreadsheet(context, balance, newCurrency.code);
        initialBalance.value = balance;
        currency.value = getCurrencyByCode(newCurrency.code) || CURRENCIES[0];
      };

      const saveCategories = async (newCategories: Record<string, string>, type: TransactionType) => {
        const numberOfCurrentCategories = Object.keys(categories.value[type]).length;

        await saveCategoriesToSpreadsheet(context, newCategories, type, numberOfCurrentCategories);

        categories.value[type] = newCategories;

        const currentYear = new Date().getFullYear();
        await rebuildYearTab(currentYear.toString());
      };

      const rebuildYearTab = async (year: string) => {
        await deleteYearTabFromSpreadsheet(context, year);

        await buildYearTab(year);
      };

      const getContext = () => context;

      const getTransactionIndex = (transactionId: string) => {
        return transactions.value.findIndex(({ id }) => id === transactionId);
      };

      const updateTransaction = async (transaction: Transaction) => {
        await transactionRowsWriteRunner.run(null, async () => {
          const transactionIndex = getTransactionIndex(transaction.id);

          if (transactionIndex < 0) {
            const pendingIndex = pendingTransactions.value.findIndex(({ id }) => id === transaction.id);

            if (pendingIndex < 0) throw new Error('[Finance Store] Transaction not found.');
            pendingTransactions.value[pendingIndex] = transaction;
          }

          await changeTransactionInSpreadsheet(context, transaction, transactionIndex + 1);

          transactions.value[transactionIndex] = transaction;
        });
      };

      const deleteTransaction = async (transaction: Transaction) => {
        await transactionRowsWriteRunner.run(null, async () => {
          const transactionIndex = getTransactionIndex(transaction.id);

          if (transactionIndex < 0) {
            const pendingIndex = pendingTransactions.value.findIndex(({ id }) => id === transaction.id);

            if (pendingIndex < 0) throw new Error('[Finance Store] Transaction not found.');

            pendingTransactions.value.splice(pendingIndex, 1);
            return;
          }

          const { spreadsheetId, sheets } = context;
          const tabId = sheets[SPREADSHEET_SCHEMA.transactionsTab.key];
          const startRowIndex = transactionIndex + 1;

          await deleteRowsFromSpreadsheet(spreadsheetId, tabId, startRowIndex, 1);

          transactions.value.splice(transactionIndex, 1);
        });
      };

      return {
        initialBalance,
        spendingCategoriesTitles,
        incomeCategoriesTitles,
        transactions,
        monthIncome,
        monthSpending,
        categories,
        addTransaction,
        allTransactionsGrouped,
        currency,
        pendingTransactions,
        getSettings,
        saveSettings,
        syncLocalTransactions,
        getTransactions,
        updateContext,
        getAnalyticsYears,
        saveCategories,
        saveBalanceAndCurrency,
        getContext,
        checkYearExistanceInSpreadsheet,
        transactionsCount,
        updateTransaction,
        deleteTransaction,
        transactionsLoading,
      };
    },
    {
      persist: true,
    },
  );
