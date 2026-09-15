import { storeToRefs } from 'pinia';
import { batchUpdateSpreadsheet } from '../api/sheets';
import { useGoogleStore } from '../stores/google';
import type { SheetsRowData, SpreadsheetSettings } from '../types/api';
import { buildRow, buildUpdateCellsValueRequest } from '../utils/requestsFactory';

export const saveSettings = async (saveData: SpreadsheetSettings): Promise<boolean> => {
  const googleStore = useGoogleStore();
  const { spreadsheetId, sheetsId } = storeToRefs(googleStore);

  if (!spreadsheetId.value || sheetsId.value.total == null) return false;

  try {
    const spendingCategoriesRows: SheetsRowData[] = saveData.spendingCategories.reduce((acc, category) => {
      return [...acc, buildRow([category])];
    }, [] as SheetsRowData[]);

    const incomeCategoriesRows: SheetsRowData[] = saveData.incomeCategories.reduce((acc, category) => {
      return [...acc, buildRow([category])];
    }, [] as SheetsRowData[]);

    const saveBalanceAndCurrency = buildUpdateCellsValueRequest(sheetsId.value.total, 2, 1, [
      buildRow([Number(saveData.balance), saveData.currency]),
    ]);
    const saveSpendingCategories = buildUpdateCellsValueRequest(sheetsId.value.total, 5, 0, spendingCategoriesRows);
    const saveIncomegCategories = buildUpdateCellsValueRequest(sheetsId.value.total, 5, 1, incomeCategoriesRows);

    const requestBody = [saveBalanceAndCurrency, saveSpendingCategories, saveIncomegCategories];

    await batchUpdateSpreadsheet(spreadsheetId.value, requestBody);

    return true;
  } catch (error) {
    console.warn('Failed to save settings', error);

    return false;
  }
};
