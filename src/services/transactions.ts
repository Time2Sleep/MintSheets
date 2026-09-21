import { batchUpdateSpreadsheet, getSpreadsheetValues } from '../api/sheets';
import type { SheetsRowData, SpreadsheetContext } from '../types/api';
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

export const rowToTransaction = ([id, date, type, category, amount, comment]: (
  string | number
)[]): Transaction | null => {
  if (
    typeof id !== 'string' ||
    typeof date !== 'number' ||
    typeof type !== 'string' ||
    typeof category !== 'string' ||
    typeof amount !== 'number'
  ) {
    return null;
  }
  const parsedDate = sheetDateToStringDate(date);

  if (!isTransactionType(type) || !parsedDate || !category) {
    return null;
  }

  const normalizedComment = typeof comment === 'string' ? comment : '';

  return {
    id,
    date: parsedDate,
    type,
    category,
    amount,
    comment: normalizedComment,
  };
};

export const formDataToTransaction = ({ amount, ...rest }: TransactionFormData): Omit<Transaction, 'id'> | null => {
  const parsedAmount = parseFloat(amount);

  if (!Number.isFinite(parsedAmount)) {
    return null;
  }

  return { ...rest, amount: parsedAmount };
};

export const saveTransactionsToSpreadsheet = async (
  context: SpreadsheetContext,
  transactions: Transaction[],
): Promise<void> => {
  const rows = transactions.map(transactionToRowData);
  const response = await batchUpdateSpreadsheet(context.spreadsheetId, [
    buildInsertRowRequest(context.sheets.transactions, 1, transactions.length + 1),
    buildUpdateCellsValueRequest(context.sheets.transactions, 1, 0, rows),
  ]);

  const hasErrors = response.replies.some((reply) => Object.keys(reply).length > 0);

  if (hasErrors) throw new Error('[Transactions Service] Failed to save transactions.');
};

export const getTransactionsFromSpreadsheet = async (context: SpreadsheetContext): Promise<Transaction[]> => {
  const rows = await getSpreadsheetValues<string | number>(context.spreadsheetId, 'Transactions!A2:F');

  return rows.map(rowToTransaction).filter((transaction): transaction is Transaction => transaction !== null);
};

export const syncTransactions = async (
  context: SpreadsheetContext,
  remoteTransactions: Transaction[],
  pendingTransactions: Transaction[],
): Promise<{ syncedIds: string[]; unsyncedIds: string[] }> => {
  if (!pendingTransactions.length) return { syncedIds: [], unsyncedIds: [] };

  const remoteTransactionsIDs = new Set(remoteTransactions.map(({ id }) => id));
  const alreadySyncedIds = pendingTransactions.filter(({ id }) => remoteTransactionsIDs.has(id)).map(({ id }) => id);
  const transactionsToResend = pendingTransactions.filter(({ id }) => !remoteTransactionsIDs.has(id));

  if (!transactionsToResend.length) {
    return {
      syncedIds: pendingTransactions.map(({ id }) => id),
      unsyncedIds: [],
    };
  }

  const transactionsIDs = transactionsToResend.map(({ id }) => id);

  try {
    await saveTransactionsToSpreadsheet(context, transactionsToResend);

    return {
      syncedIds: [...alreadySyncedIds, ...transactionsIDs],
      unsyncedIds: [],
    };
  } catch {
    return {
      syncedIds: alreadySyncedIds,
      unsyncedIds: transactionsIDs,
    };
  }
};
