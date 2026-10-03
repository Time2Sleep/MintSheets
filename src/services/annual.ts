import { batchUpdateSpreadsheet } from '../api/sheets';
import { SPREADSHEET_SCHEMA } from '../schemas/spreadsheet';
import { TransactionTypes, type TransactionType } from '../types/finances';
import type { RawCellValue, SpreadsheetUpdateBordersRequest } from '../types/spreadsheet';
import { indexToColumn } from '../utils/convert';
import { buildUpdateBordersRequest, buildUpdateCellsValueRequest } from '../utils/requestsFactory';
import { buildOtherSheetRange } from '../utils/spreadsheet';
import { createSpreadsheetTab, deleteSpreadsheetTab } from './spreadsheet';

export const initYear = async (
  spreadsheetId: string,
  year: number,
  categories: { spending: Record<string, string>; income: Record<string, string> },
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
  categories: { spending: Record<string, string>; income: Record<string, string> },
) => {
  const yearSchema = SPREADSHEET_SCHEMA.yearTab;

  const spendingCategoriesRows = Object.entries(categories.spending).map((category, index) => {
    const rowIndex = index + yearSchema.coords.categories.row + 1;
    return buildCategoryRow(category, rowIndex, year, TransactionTypes.SPENDING);
  });

  const spendingSummaryRow = buildSummaryRow(
    'Spending total',
    Object.keys(categories.spending).length,
    yearSchema.coords.categories.row,
  );

  const incomeCategoriesRows = Object.entries(categories.income).map((category, index) => {
    const rowIndex =
      index + yearSchema.coords.categories.row + spendingCategoriesRows.length + yearSchema.gaps.blocks + 1;
    return buildCategoryRow(category, rowIndex, year, TransactionTypes.INCOME);
  });

  const incomeSummaryRow = buildSummaryRow(
    'Income total',
    Object.keys(categories.income).length,
    yearSchema.coords.categories.row + spendingCategoriesRows.length + yearSchema.gaps.blocks,
  );

  const spendingsTotalIndex = Object.keys(categories.spending).length + yearSchema.coords.categories.row + 1;
  const incomeTotalIndex =
    Object.keys(categories.income).length +
    yearSchema.coords.categories.row +
    spendingCategoriesRows.length +
    yearSchema.gaps.blocks +
    1;
  const differenceRows = buildDifferenceRows(spendingsTotalIndex, incomeTotalIndex);

  await batchUpdateSpreadsheet(spreadsheetId, [
    buildUpdateCellsValueRequest(tabId, 0, 0, [
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
    ...buildBordersRequests(tabId, Object.keys(categories.spending).length, Object.keys(categories.income).length).map(
      (request) => ({
        ...request,
      }),
    ),
  ]);
};

const buildCategoryRow = (
  [categoryName, goal]: [string, string],
  rowIndex: number,
  year: number,
  type: TransactionType,
): RawCellValue[] => {
  const yearSchema = SPREADSHEET_SCHEMA.yearTab;
  const { columns } = yearSchema;

  const transactionsSchema = SPREADSHEET_SCHEMA.transactionsTab;
  const { title: transactionsTabName, columns: transactionColumns, coords: transactionCoords } = transactionsSchema;

  const categoryGoal = Number.isFinite(Number(goal)) ? Number(goal) : 0;
  const average = {
    value: `=IFERROR(AVERAGE(${columns.january}${rowIndex}:${columns.december}${rowIndex}), 0)`,
    format: { formula: true },
  };
  const row = [categoryName, categoryGoal, average];

  //12 months
  for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
    const transactionAmount = buildOtherSheetRange(
      transactionsTabName,
      transactionColumns.Amount,
      transactionCoords.transactions.row,
      transactionColumns.Amount,
    );
    const transactionDate = buildOtherSheetRange(
      transactionsTabName,
      transactionColumns.Date,
      transactionCoords.transactions.row,
      transactionColumns.Date,
    );
    const monthCondition = `--(MONTH(${transactionDate})=${monthIndex})`;
    const yearCondition = `--(YEAR(${transactionDate})=${year})`;

    const transactionCategory = buildOtherSheetRange(
      transactionsTabName,
      transactionColumns.Category,
      transactionCoords.transactions.row,
      transactionColumns.Category,
    );
    const categoryCondition = `--((${transactionCategory})="${categoryName}")`;

    const transactionType = buildOtherSheetRange(
      transactionsTabName,
      transactionColumns.Type,
      transactionCoords.transactions.row,
      transactionColumns.Type,
    );
    const typeCondition = `--((${transactionType})="${type}")`;

    const formula = {
      value: `=SUMPRODUCT(${transactionAmount},${monthCondition},${yearCondition},${categoryCondition},${typeCondition})`,
      format: { formula: true },
    };

    row.push(formula);
  }

  const annual = {
    value: `=SUM(${columns.january}${rowIndex}:${columns.december}${rowIndex})`,
    format: { formula: true },
  };
  row.push(annual);

  return row;
};

const buildSummaryRow = (title: string, length: number, initRowIndex: number): RawCellValue[] => {
  const row: RawCellValue[] = [{ value: title, format: { bold: true } }];

  const columnsCount = SPREADSHEET_SCHEMA.yearTab.columns.count;
  for (let column = 1; column <= columnsCount; column++) {
    const columnLetter = indexToColumn(column);
    const formula = {
      value: `=SUM(${columnLetter}${initRowIndex}:${columnLetter}${initRowIndex + length - 1})`,
      format: { formula: true },
    };
    row.push(formula);
  }

  return row;
};

const buildDifferenceRows = (totalSpendingRow: number, totalIncomeRow: number): RawCellValue[][] => {
  const differenceRow: RawCellValue[] = [{ value: 'Difference', format: { bold: true } }];
  const savingPercentageRow: RawCellValue[] = [{ value: 'Saved, %' }];

  const columnsCount = SPREADSHEET_SCHEMA.yearTab.columns.count;
  for (let column = 1; column <= columnsCount; column++) {
    const columnLetter = indexToColumn(column);

    differenceRow.push({
      value: `=${columnLetter}${totalIncomeRow} - ${columnLetter}${totalSpendingRow}`,
      format: { formula: true },
    });

    savingPercentageRow.push({
      value: `=IFERROR((${columnLetter}${totalIncomeRow}-${columnLetter}${totalSpendingRow})/${columnLetter}${totalIncomeRow}, 0)`,
      format: { formula: true, numberFormat: 'PERCENT' },
      pattern: '0.00%',
    });
  }

  return [differenceRow, savingPercentageRow];
};

const buildBordersRequests = (
  sheetId: number,
  spendingCategoriesLength: number,
  incomeCategoriesLength: number,
): SpreadsheetUpdateBordersRequest[] => {
  const { borders, coords, gaps, columns } = SPREADSHEET_SCHEMA.yearTab;

  const headerRange = `${columns.categories}${coords.categories.row}:${columns.average}${coords.categories.row}`;
  const headerBordersRequest = buildUpdateBordersRequest(sheetId, { ...borders.leftPart, range: headerRange });

  const monthsRange = `${columns.january}${coords.categories.row}:${columns.december}${coords.categories.row}`;
  const monthsBordersRequest = buildUpdateBordersRequest(sheetId, { ...borders.months, range: monthsRange });

  const annualRange = `${columns.annual}${coords.categories.row}:${columns.annual}${coords.categories.row}`;
  const annualBordersRequest = buildUpdateBordersRequest(sheetId, { ...borders.annual, range: annualRange });

  const spendingCategoriesLastRowIndex = spendingCategoriesLength + coords.categories.row + 1;
  const spendingCategoriesRange = `${columns.categories}${coords.categories.row + 1}:${columns.average}${spendingCategoriesLastRowIndex}`;
  const spendingCategoriesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.categories,
    range: spendingCategoriesRange,
  });

  const totalSpendingRange = `${columns.categories}${spendingCategoriesLastRowIndex}:${columns.annual}${spendingCategoriesLastRowIndex + 1}`;
  const totalSpendingBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.total,
    range: totalSpendingRange,
  });

  const incomeCategoriesFirstRowIndex = gaps.blocks + spendingCategoriesLastRowIndex;
  const incomeCategoriesLastRowIndex = incomeCategoriesLength + incomeCategoriesFirstRowIndex;
  const incomeCategoriesRange = `${columns.categories}${incomeCategoriesFirstRowIndex}:${columns.average}${incomeCategoriesLastRowIndex}`;
  const incomeCategoriesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.leftPart,
    range: incomeCategoriesRange,
  });

  const totalIncomeRange = `${columns.categories}${incomeCategoriesLastRowIndex}:${columns.annual}${incomeCategoriesLastRowIndex + 1}`;
  const totalIncomeBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.total,
    range: totalIncomeRange,
  });

  const monthsSpendingRange = `${columns.january}${coords.categories.row + 1}:${columns.december}${spendingCategoriesLastRowIndex}`;
  const monthsSpendingValuesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.months,
    range: monthsSpendingRange,
  });

  const monthsIncomeValuesRange = `${columns.january}${incomeCategoriesFirstRowIndex}:${columns.december}${incomeCategoriesLastRowIndex}`;
  const monthsIncomeValuesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.months,
    range: monthsIncomeValuesRange,
  });

  const annualSpendingRange = `${columns.annual}${coords.categories.row + 1}:${columns.annual}${spendingCategoriesLastRowIndex}`;
  const annualSpendingValuesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.annual,
    range: annualSpendingRange,
  });

  const annualIncomeValuesRange = `${columns.annual}${incomeCategoriesFirstRowIndex}:${columns.annual}${incomeCategoriesLastRowIndex}`;
  const annualIncomeValuesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.annual,
    range: annualIncomeValuesRange,
  });

  const differenceRowsFirstRowIndex = incomeCategoriesLastRowIndex + gaps.blocks - 1;
  const differenceRowsLastRowIndex = differenceRowsFirstRowIndex + 1;
  const differenceCategoriesRange = `${columns.categories}${differenceRowsFirstRowIndex}:${columns.average}${differenceRowsLastRowIndex}`;
  const differenceCategoriesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.leftPart,
    range: differenceCategoriesRange,
  });

  const differenceMonthsRange = `${columns.january}${differenceRowsFirstRowIndex}:${columns.december}${differenceRowsLastRowIndex}`;
  const differenceMonthsBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.months,
    range: differenceMonthsRange,
  });

  const differenceAnnualRange = `${columns.annual}${differenceRowsFirstRowIndex}:${columns.annual}${differenceRowsLastRowIndex}`;
  const differenceAnnualBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.annual,
    range: differenceAnnualRange,
  });

  return [
    headerBordersRequest,
    monthsBordersRequest,
    annualBordersRequest,
    spendingCategoriesBordersRequest,
    totalSpendingBordersRequest,
    totalIncomeBordersRequest,
    incomeCategoriesBordersRequest,
    monthsSpendingValuesBordersRequest,
    monthsIncomeValuesBordersRequest,
    annualSpendingValuesBordersRequest,
    annualIncomeValuesBordersRequest,
    differenceCategoriesBordersRequest,
    differenceMonthsBordersRequest,
    differenceAnnualBordersRequest,
  ];
};
