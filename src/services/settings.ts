import { batchUpdateSpreadsheet, getSpreadsheetValues } from '../api/sheets';
import type { SpreadsheetContext } from '../types/spreadsheet';
import { buildUpdateCellsValueRequest } from '../utils/requestsFactory';
import { getCurrencyByCode } from '../utils/currency';
import { CURRENCIES } from '../constants/currencies';
import type { SpreadsheetSettings, SpreadsheetSettingsFormData } from '../types/finances';
import { SPREADSHEET_SCHEMA } from '../schemas/spreadsheet';

export const saveSettingsToSpreadsheet = async (
  context: SpreadsheetContext,
  saveData: SpreadsheetSettingsFormData,
): Promise<void> => {
  const settingsSchema = SPREADSHEET_SCHEMA.settingsTab;
  const settingsSheetId = context.sheets[settingsSchema.key];
  const { coords } = settingsSchema;

  const saveBalanceAndCurrency = buildUpdateCellsValueRequest(
    settingsSheetId,
    coords.balance.row,
    coords.balance.column,
    [[Number(saveData.balance), saveData.currency]],
  );

  const saveSpendingCategories = buildUpdateCellsValueRequest(
    settingsSheetId,
    coords.spendingCategories.row,
    coords.spendingCategories.column,
    [...Object.entries(saveData.spendingCategories), ...Array(100).fill(['', ''])],
  );

  const saveIncomegCategories = buildUpdateCellsValueRequest(
    settingsSheetId,
    coords.incomeCategories.row,
    coords.incomeCategories.column,
    [...Object.entries(saveData.incomeCategories), ...Array(100).fill(['', ''])],
  );

  const setStatusToActive = buildUpdateCellsValueRequest(settingsSheetId, coords.status.row, coords.status.column, [
    ['active'],
  ]);

  const requestBody = [setStatusToActive, saveBalanceAndCurrency, saveSpendingCategories, saveIncomegCategories];

  await batchUpdateSpreadsheet(context.spreadsheetId, requestBody);
};

export const fetchSettingsFromSpreadsheet = async (context: SpreadsheetContext): Promise<SpreadsheetSettings> => {
  const { title, coords, ranges } = SPREADSHEET_SCHEMA.settingsTab;
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
    spendingCategories,
    incomeCategories,
  };
};
