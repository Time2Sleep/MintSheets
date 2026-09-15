import { batchUpdateSpreadsheet, getSpreadsheetValues } from '../api/sheets';
import { useFinanceStore } from '../stores/finances';
import { useGoogleStore } from '../stores/google';
import type { SheetsRowData } from '../types/api';
import { type Transaction, type TransactionFormData, TransactionTypes } from '../types/finances';
import { sheetDateToStringDate, stringDateToSheetDate } from '../utils/date';
import { buildInsertRowRequest, buildUpdateCellsValueRequest } from '../utils/requestsFactory';

export const transactionToRowData = ({ id, date, type, amount, category, comment }: Transaction): SheetsRowData => ({
  values: [
    { userEnteredValue: { stringValue: id } },
    {
      userEnteredValue: { numberValue: stringDateToSheetDate(date) },
      userEnteredFormat: { numberFormat: { type: 'DATE', pattern: 'YYYY-MM-DD' } },
    },
    { userEnteredValue: { stringValue: type } },
    { userEnteredValue: { stringValue: category } },
    { userEnteredValue: { numberValue: amount } },
    { userEnteredValue: { stringValue: comment ?? '' } },
  ],
});

const isTransactionType = (value: string): value is Transaction['type'] => {
  return Object.values(TransactionTypes).includes(value as Transaction['type']);
};

export const rowToTransaction = ([id, date, type, category, amount, comment]: string[]): Transaction | null => {
  const parsedDate = sheetDateToStringDate(date);
  const parsedAmount = parseFloat(amount);

  if (!Number.isFinite(parsedAmount) || !isTransactionType(type) || !parsedDate || !category) {
    return null;
  }

  return {
    id,
    date: parsedDate,
    type,
    category,
    amount: parsedAmount,
    comment,
  };
};

export const formDataToTransaction = ({ amount, ...rest }: TransactionFormData): Omit<Transaction, 'id'> | null => {
  const parsedAmount = parseFloat(amount);

  if (!Number.isFinite(parsedAmount)) {
    return null;
  }

  return { ...rest, amount: parsedAmount };
};

export const saveTransactionsToSpreadsheet = async (transactions: Transaction[]): Promise<boolean> => {
  try {
    const googleStore = useGoogleStore();
    if (!googleStore.spreadsheetId) throw new Error('Spreadsheet ID is not set');
    if (googleStore.sheetsId.transactions == null) throw new Error('Transactions sheet ID is not set');

    const rows = transactions.map(transactionToRowData);
    const response = await batchUpdateSpreadsheet(googleStore.spreadsheetId, [
      buildInsertRowRequest(googleStore.sheetsId.transactions, 1, transactions.length + 1),
      buildUpdateCellsValueRequest(googleStore.sheetsId.transactions, 1, 0, rows),
    ]);

    const errorsCount = response.replies.reduce((acc, obj) => acc + Object.keys(obj).length, 0);

    return errorsCount === 0;
  } catch (error) {
    console.warn('Failed to save transactions:', error);
    return false;
  }
};

export const getTransactionsFromSpreadsheet = async (): Promise<Transaction[]> => {
  const googleStore = useGoogleStore();
  if (!googleStore.spreadsheetId) return Promise.reject('Spreadsheet ID is not set');

  const rows = await getSpreadsheetValues(googleStore.spreadsheetId, 'Transactions!A2:F');

  return rows.map(rowToTransaction).filter((transaction): transaction is Transaction => transaction !== null);
};

export const syncTransactions = async () => {
  const remoteTransactions = await getTransactionsFromSpreadsheet();

  const financesStore = useFinanceStore();

  if (!financesStore.pendingTransactions.length) {
    financesStore.transactions = remoteTransactions;
    return;
  }

  const confirmedTransactionIds = new Set<string>();
  const remoteTransactionsIDs = new Set(remoteTransactions.map(({ id }) => id));
  const persistedTransactionsDictionary = financesStore.transactions.reduce(
    (acc, cur) => {
      acc[cur.id] = cur;
      return acc;
    },
    {} as Record<string, Transaction>,
  );

  const resentTransactions: Transaction[] = [];

  financesStore.pendingTransactions.forEach((id) => {
    if (remoteTransactionsIDs.has(id)) {
      confirmedTransactionIds.add(id);

      return;
    }

    const persistedTransaction = persistedTransactionsDictionary[id];

    if (persistedTransaction) {
      resentTransactions.push(persistedTransaction);
    }
  });

  financesStore.pendingTransactions = financesStore.pendingTransactions.filter(
    (id) => !confirmedTransactionIds.has(id),
  );

  financesStore.transactions = [...resentTransactions, ...remoteTransactions];

  if (!resentTransactions.length) return;
  const result = await saveTransactionsToSpreadsheet(resentTransactions);

  if (result) removeTransactionsFromPending(resentTransactions.map(({ id }) => id));
};

export const removeTransactionsFromPending = (transactionIDs: string | string[]) => {
  const financesStore = useFinanceStore();

  if (Array.isArray(transactionIDs))
    financesStore.pendingTransactions = financesStore.pendingTransactions.filter((id) => !transactionIDs.includes(id));
  else financesStore.pendingTransactions = financesStore.pendingTransactions.filter((id) => id !== transactionIDs);
};
