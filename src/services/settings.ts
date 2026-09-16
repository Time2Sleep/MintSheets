import { batchUpdateSpreadsheet, getSpreadsheetValues } from '../api/sheets';
import type { SheetsRowData } from '../types/api';
import { buildRow, buildUpdateCellsValueRequest } from '../utils/requestsFactory';
import { getCurrencyByCode } from '../utils/currency';
import { CURRENCIES } from '../constants/currencies';
import type { SpreadsheetSettings, SpreadsheetSettingsFormData } from '../types/finances';

export const saveSettingsToSpreadsheet = async (
  spreadsheetId: string,
  totalSheetId: number,
  saveData: SpreadsheetSettingsFormData,
): Promise<void> => {
  const spendingCategoriesRows: SheetsRowData[] = saveData.spendingCategories.map((category) => buildRow([category]));
  const incomeCategoriesRows: SheetsRowData[] = saveData.incomeCategories.map((category) => buildRow([category]));

  const saveBalanceAndCurrency = buildUpdateCellsValueRequest(totalSheetId, 2, 1, [
    buildRow([Number(saveData.balance), saveData.currency]),
  ]);
  const saveSpendingCategories = buildUpdateCellsValueRequest(totalSheetId, 5, 0, spendingCategoriesRows);
  const saveIncomegCategories = buildUpdateCellsValueRequest(totalSheetId, 5, 1, incomeCategoriesRows);
  const setStatusToActive = buildUpdateCellsValueRequest(0, 0, 1, [buildRow(['active'])]);

  const requestBody = [setStatusToActive, saveBalanceAndCurrency, saveSpendingCategories, saveIncomegCategories];

  await batchUpdateSpreadsheet(spreadsheetId, requestBody);
};

export const fetchSettingsFromSpreadsheet = async (spreadsheetId: string): Promise<SpreadsheetSettings> => {
  const rows = await getSpreadsheetValues(spreadsheetId, 'Total!A3:C');

  if (!rows.length) {
    throw new Error('Spreadsheet settings are missing');
  }

  const balance = Number(rows[0][1]);
  const currency = getCurrencyByCode(rows[0][2]) || CURRENCIES[0];
  const spendingCategories: string[] = [];
  const incomeCategories: string[] = [];

  rows.slice(3).forEach((row) => {
    if (row[0]) spendingCategories.push(row[0]);
    if (row[1]) incomeCategories.push(row[1]);
  });

  return {
    balance,
    currency,
    spendingCategories,
    incomeCategories,
  };
};
