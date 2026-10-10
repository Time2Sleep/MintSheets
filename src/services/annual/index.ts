import { batchUpdateSpreadsheet } from '../../api/sheets';
import { SPREADSHEET_SCHEMA } from '../../schemas/spreadsheet';
import { TransactionTypes, type Categories } from '../../types/finances';
import type { AnnualTabRowIndexes, SpreadsheetContext } from '../../types/spreadsheet';
import { buildUpdateCellsValueRequest } from '../../utils/requestsFactory';
import { createSpreadsheetTabs, deleteSpreadsheetTab } from '../spreadsheet';
import { buildBordersRequests } from './borders';
import { buildCategoriesRows, buildDifferenceRows, buildSummaryRow } from './data';

export const initYearTab = async (
  spreadsheetId: string,
  year: string,
  categories: Categories,
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

const createYearTab = async (spreadsheetId: string, year: string): Promise<number> => {
  const yearNumber = Number(year);

  if (Number.isNaN(yearNumber) || yearNumber < 1970 || yearNumber > 3000)
    throw new Error('[Annual Service]: invalid year!');

  const [yearTab] = await createSpreadsheetTabs(spreadsheetId, String(year));
  return yearTab;
};

const configureYearTab = async (tabId: number, spreadsheetId: string, year: string, categories: Categories) => {
  const yearSchema = SPREADSHEET_SCHEMA.yearTab;

  const indexes = calculateRowIndexes(categories);

  const totalSaved = { value: `=${yearSchema.columns.annual}${indexes.differenceFirst}`, format: { formula: true } };

  const spendingCategoriesRows = buildCategoriesRows(
    categories.spending,
    TransactionTypes.SPENDING,
    year,
    indexes.spendingFirst,
  );

  const spendingSummaryRow = buildSummaryRow(
    'Spending total',
    Object.keys(categories.spending).length,
    indexes.spendingFirst,
  );

  const incomeCategoriesRows = buildCategoriesRows(
    categories.income,
    TransactionTypes.INCOME,
    year,
    indexes.incomeFirst,
  );

  const incomeSummaryRow = buildSummaryRow('Income total', Object.keys(categories.income).length, indexes.incomeFirst);

  const differenceRows = buildDifferenceRows(indexes.spendingLast, indexes.incomeLast);

  const bordersRequests = buildBordersRequests(tabId, indexes);

  await batchUpdateSpreadsheet(spreadsheetId, [
    buildUpdateCellsValueRequest(tabId, yearSchema.coords.dataStart.row, yearSchema.coords.dataStart.column, [
      [totalSaved],
      ...yearSchema.initialRows,
      ...spendingCategoriesRows,
      spendingSummaryRow,
      [''], //empty line between spending and income
      [yearSchema.titles.income],
      ...incomeCategoriesRows,
      incomeSummaryRow,
      [''], //empty line between income and difference
      ...differenceRows,
    ]),
    ...bordersRequests,
  ]);
};

const calculateRowIndexes = (categories: Categories): AnnualTabRowIndexes => {
  const spendingCategoriesLength = Object.keys(categories.spending).length;
  const incomeCategoriesLength = Object.keys(categories.income).length;

  const yearSchema = SPREADSHEET_SCHEMA.yearTab;
  const { coords, gaps } = yearSchema;

  const spendingFirst = coords.categories.row + 1;
  const spendingLast = spendingCategoriesLength + spendingFirst;
  const incomeFirst = gaps.blocks + spendingLast;
  const incomeLast = incomeCategoriesLength + incomeFirst;
  const differenceFirst = incomeLast + gaps.blocks - 1;
  const differenceLast = differenceFirst + 1;

  return {
    spendingFirst,
    spendingLast,
    incomeFirst,
    incomeLast,
    differenceFirst,
    differenceLast,
  };
};

export const deleteYearTabFromSpreadsheet = async (context: SpreadsheetContext, year: string) => {
  const yearTabId = context.sheets[year];

  if (!yearTabId) return;
  await deleteSpreadsheetTab(context.spreadsheetId, yearTabId);
};
