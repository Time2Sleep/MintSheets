import { batchUpdateSpreadsheet } from '../api/sheets';
import { SPREADSHEET_SCHEMA } from '../schemas/spreadsheet';
import { TransactionTypes, type TransactionType } from '../types/finances';
import type { RawCellValue } from '../types/spreadsheet';
import { buildUpdateCellsValueRequest } from '../utils/requestsFactory';
import { createSpreadsheetTab, deleteSpreadsheetTab } from './spreadsheet';

export const initYear = async (
  spreadsheetId: string,
  year: number,
  categories: { spending: string[]; income: string[] },
): Promise<number | null> => {
  let tabId;

  try {
    tabId = await createYearTab(spreadsheetId, year);
    await configureYearTab(tabId, spreadsheetId, year, categories);

    return tabId;
  } catch (error) {
    console.warn('[Year Service] Failed to initialize year:', error);

    if (tabId) {
      try {
        await deleteSpreadsheetTab(spreadsheetId, tabId);
      } catch (cleanupError) {
        console.warn('[Year Service] Failed to cleanup year tab:', cleanupError);
      }
    }

    return null;
  }
};

const createYearTab = async (spreadsheetId: string, year: number): Promise<number> => {
  if (year < 1970 || year > 3000) throw new Error('[Annual Service]: invalid year!');

  return await createSpreadsheetTab(spreadsheetId, String(year));
};

const configureYearTab = async (
  tabId: number,
  spreadsheetId: string,
  year: number,
  categories: { spending: string[]; income: string[] },
) => {
  const yearSchema = SPREADSHEET_SCHEMA.yearTab;

  const spendingCategoriesRows = categories.spending.map((category, index) => {
    const rowIndex = index + yearSchema.coords.categories.row;
    return buildCategoryRow(category, rowIndex, year, TransactionTypes.SPENDING);
  });

  const incomeTitle = { value: 'Income', format: { bold: true } };

  const incomeCategoriesRows = categories.income.map((category, index) => {
    const rowIndex = index + yearSchema.coords.categories.row + spendingCategoriesRows.length + 2; // 2 = 1 empty line + 1 header line
    return buildCategoryRow(category, rowIndex, year, TransactionTypes.INCOME);
  });

  await batchUpdateSpreadsheet(spreadsheetId, [
    buildUpdateCellsValueRequest(tabId, 0, 0, [
      ...yearSchema.initialRows,
      ...spendingCategoriesRows,
      [''], //empty line between spending and income
      [incomeTitle],
      ...incomeCategoriesRows,
    ]),
  ]);
};

const buildCategoryRow = (category: string, rowIndex: number, year: number, type: TransactionType): RawCellValue[] => {
  const yearSchema = SPREADSHEET_SCHEMA.yearTab;
  const { ranges } = yearSchema;
  const transactionsTabName = SPREADSHEET_SCHEMA.transactionsTab.title;
  const average = {
    value: `=IFERROR(AVERAGE(${ranges.january}${rowIndex}:${ranges.december}${rowIndex}), 0)`,
    format: { formula: true },
  };
  const row = [category, average];

  //12 months
  for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
    const getSum = `${transactionsTabName}'!${ranges.sum}`;
    const checkMonth = `--(MONTH('${transactionsTabName}'!${ranges.month})=${monthIndex})`;
    const checkYear = `--(YEAR('${transactionsTabName}'!${ranges.year})=${year})`;
    const checkCategory = `--(('${transactionsTabName}'!${ranges.category})=$A${rowIndex})`;
    const checkType = `--(('${transactionsTabName}'!${ranges.type})="${type}")`;

    const formula = {
      value: `=SUMPRODUCT('${getSum},${checkMonth},${checkYear},${checkCategory},${checkType})`,
      format: { formula: true },
    };

    row.push(formula);
  }

  const annual = {
    value: `=SUM(${ranges.january}${rowIndex}:${ranges.december}${rowIndex})`,
    format: { formula: true },
  };
  row.push(annual);

  return row;
};
