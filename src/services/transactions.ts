import { batchUpdateSpreadsheet, getSpreadsheetValues } from '../api/sheets';
import type { RawCellValue, SpreadsheetContext } from '../types/spreadsheet';
import { type Transaction, type TransactionFormData, TransactionTypes } from '../types/finances';
import { sheetDateToStringDate, stringDateToSheetDate } from '../utils/date';
import { buildInsertRowRequest, buildUpdateCellsValueRequest } from '../utils/requestsFactory';
import { SPREADSHEET_SCHEMA } from '../schemas/spreadsheet';

export const transactionToRawCellValues = ({
  id,
  date,
  type,
  amount,
  category,
  comment,
}: Transaction): RawCellValue[] => [
  id,
  { value: stringDateToSheetDate(date), format: { date: true } },
  type,
  category,
  amount,
  comment ?? '',
];

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
  const rows = transactions.map(transactionToRawCellValues);
  const START_ROW_INDEX = 1;
  const START_COLUMN_INDEX = 0;

  const response = await batchUpdateSpreadsheet(context.spreadsheetId, [
    buildInsertRowRequest(
      context.sheets[SPREADSHEET_SCHEMA.transactionsTab.key],
      START_ROW_INDEX,
      transactions.length + 1,
    ),
    buildUpdateCellsValueRequest(
      context.sheets[SPREADSHEET_SCHEMA.transactionsTab.key],
      START_ROW_INDEX,
      START_COLUMN_INDEX,
      rows,
    ),
  ]);

  const hasErrors = response.replies.some((reply) => Object.keys(reply).length > 0);

  if (hasErrors) throw new Error('[Transactions Service] Failed to save transactions.');
};

export const getTransactionsFromSpreadsheet = async (context: SpreadsheetContext): Promise<Transaction[]> => {
  const query = `${SPREADSHEET_SCHEMA.transactionsTab.title}!${SPREADSHEET_SCHEMA.transactionsTab.ranges.transactions}`;
  const rows = await getSpreadsheetValues<string | number>(context.spreadsheetId, query);

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
