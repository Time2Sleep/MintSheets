import { batchUpdateSpreadsheet, getSpreadsheetValues } from '../api/sheets';
import type { SpreadsheetContext } from '../types/spreadsheet';
import { buildUpdateCellsValueRequest } from '../utils/requestsFactory';
import { getCurrencyByCode } from '../utils/currency';
import { CURRENCIES } from '../constants/currencies';
import {
  TransactionTypes,
  type SpreadsheetSettings,
  type SpreadsheetSettingsFormData,
  type TransactionType,
} from '../types/finances';
import { SPREADSHEET_SCHEMA } from '../schemas/spreadsheet';

const settingsSchema = SPREADSHEET_SCHEMA.settingsTab;

export const saveSettingsToSpreadsheet = async (
  context: SpreadsheetContext,
  saveData: SpreadsheetSettingsFormData,
): Promise<void> => {
  const settingsSheetId = context.sheets[settingsSchema.key];
  const { coords } = settingsSchema;

  const saveBalanceAndCurrency = buildUpdateCellsValueRequest(
    settingsSheetId,
    coords.balance.row,
    coords.balance.column,
    [[Number(saveData.balance), saveData.currency]],
  );

  buildSaveCategoriesRequest(settingsSheetId, saveData.spendingCategories, TransactionTypes.SPENDING);
  const saveSpendingCategories = buildSaveCategoriesRequest(
    settingsSheetId,
    saveData.spendingCategories,
    TransactionTypes.SPENDING,
  );

  const saveIncomegCategories = buildSaveCategoriesRequest(
    settingsSheetId,
    saveData.incomeCategories,
    TransactionTypes.INCOME,
  );

  const setStatusToActive = buildUpdateCellsValueRequest(settingsSheetId, coords.status.row, coords.status.column, [
    ['active'],
  ]);

  const requestBody = [setStatusToActive, saveBalanceAndCurrency, saveSpendingCategories, saveIncomegCategories];

  await batchUpdateSpreadsheet(context.spreadsheetId, requestBody);
};

export const fetchSettingsFromSpreadsheet = async (context: SpreadsheetContext): Promise<SpreadsheetSettings> => {
  const { title, coords, ranges } = settingsSchema;
  const rows = await getSpreadsheetValues(context.spreadsheetId, `${title}!${ranges.read}`);

  if (!rows.length) {
    throw new Error('Spreadsheet settings are missing');
  }

  const balanceCell = rows[coords.balance.row][coords.balance.column];
  const balance = typeof balanceCell === 'number' ? balanceCell : 0;

  const currencyCell = rows[coords.currency.row][coords.currency.column];
  const currencyCode = typeof currencyCell === 'string' ? currencyCell : CURRENCIES[0].code;
  const currency = getCurrencyByCode(currencyCode) || CURRENCIES[0];

  const spendingCategories: Record<string, string> = {};
  const incomeCategories: Record<string, string> = {};

  rows.slice(coords.spendingCategories.row).forEach((row) => {
    const spendingColumn = coords.spendingCategories.column;
    const incomeColumn = coords.incomeCategories.column;

    const spendingCategory = row[spendingColumn];
    const spendingGoal = row[spendingColumn + 1] || '';
    const incomeCategory = row[incomeColumn];
    const incomeGoal = row[incomeColumn + 1] || '';

    if (typeof spendingCategory === 'string' && spendingCategory) {
      spendingCategories[spendingCategory] = `${spendingGoal}`;
    }

    if (typeof incomeCategory === 'string' && incomeCategory) {
      incomeCategories[incomeCategory] = `${incomeGoal}`;
    }
  });

  return {
    balance,
    currency,
    categories: {
      spending: spendingCategories,
      income: incomeCategories,
    },
  };
};

export const saveBalanceToSpreadsheet = async (context: SpreadsheetContext, balance: number, currency: string) => {
  const settingsSheetId = context.sheets[settingsSchema.key];
  const { coords } = settingsSchema;

  const saveBalanceAndCurrency = buildUpdateCellsValueRequest(
    settingsSheetId,
    coords.balance.row,
    coords.balance.column,
    [[balance, currency]],
  );

  await batchUpdateSpreadsheet(context.spreadsheetId, [saveBalanceAndCurrency]);
};

export const saveCategoriesToSpreadsheet = async (
  context: SpreadsheetContext,
  categories: Record<string, string>,
  type: TransactionType,
  numberOfCurrentCategories: number,
) => {
  const settingsTabId = context.sheets[settingsSchema.key];
  const clearCurrentCategoriesRequest = buildClearCurrentCategoriesRequest(
    settingsTabId,
    type,
    numberOfCurrentCategories,
  );
  const saveCategoriesRequest = buildSaveCategoriesRequest(context.sheets[settingsSchema.key], categories, type);

  const requests = [clearCurrentCategoriesRequest, saveCategoriesRequest];

  await batchUpdateSpreadsheet(context.spreadsheetId, requests);
};

const buildSaveCategoriesRequest = (sheetId: number, categories: Record<string, string>, type: TransactionType) => {
  const { coords } = settingsSchema;
  const coordsKey = type === TransactionTypes.INCOME ? 'incomeCategories' : 'spendingCategories';

  return buildUpdateCellsValueRequest(sheetId, coords[coordsKey].row, coords[coordsKey].column, [
    ...Object.entries(categories),
  ]);
};

const buildClearCurrentCategoriesRequest = (sheetId: number, type: TransactionType, number: number) => {
  const { coords } = settingsSchema;
  const coordsKey = type === TransactionTypes.INCOME ? 'incomeCategories' : 'spendingCategories';

  return buildUpdateCellsValueRequest(
    sheetId,
    coords[coordsKey].row,
    coords[coordsKey].column,
    Array(number).fill(['', '']),
  );
};
