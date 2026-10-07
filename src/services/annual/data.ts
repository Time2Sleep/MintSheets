import { SPREADSHEET_SCHEMA } from '../../schemas/spreadsheet';
import type { TransactionType } from '../../types/finances';
import type { RawCellValue } from '../../types/spreadsheet';
import { indexToColumn } from '../../utils/convert';
import { buildOtherSheetRange } from '../../utils/spreadsheet';

export const buildCategoriesRows = (
  categories: Record<string, string>,
  type: TransactionType,
  year: string,
  startRowIndex: number,
): RawCellValue[][] => {
  return Object.entries(categories).map((category, index) =>
    buildCategoryRow(category, index + startRowIndex, year, type),
  );
};

const buildCategoryRow = (
  [categoryName, goal]: readonly [string, string],
  rowIndex: number,
  year: string,
  type: TransactionType,
): RawCellValue[] => {
  const yearSchema = SPREADSHEET_SCHEMA.yearTab;
  const { columns } = yearSchema;

  const categoryGoal = Number.isNaN(Number(goal)) ? 0 : Number(goal);

  const average = {
    value: `=IFERROR(AVERAGE(${columns.january}${rowIndex}:${columns.december}${rowIndex}), 0)`,
    format: { formula: true },
  };
  const monthsFormulas = buildMonthlyFormulas(year, categoryName, type);
  const annual = {
    value: `=SUM(${columns.january}${rowIndex}:${columns.december}${rowIndex})`,
    format: { formula: true },
  };

  return [categoryName, categoryGoal, average, ...monthsFormulas, annual];
};

const buildMonthlyFormulas = (year: string, categoryName: string, type: TransactionType): RawCellValue[] => {
  const monthsFormulas: RawCellValue[] = [];
  const transactionsSchema = SPREADSHEET_SCHEMA.transactionsTab;
  const { title, columns, coords } = transactionsSchema;

  const rowStart = coords.transactions.row;

  const transactionAmount = buildOtherSheetRange(title, columns.Amount, rowStart, columns.Amount);
  const transactionDate = buildOtherSheetRange(title, columns.Date, rowStart, columns.Date);
  const transactionCategory = buildOtherSheetRange(title, columns.Category, rowStart, columns.Category);
  const transactionType = buildOtherSheetRange(title, columns.Type, rowStart, columns.Type);

  const yearCondition = `--(YEAR(${transactionDate})=${year})`;
  const categoryCondition = `--((${transactionCategory})="${categoryName}")`;
  const typeCondition = `--((${transactionType})="${type}")`;

  //12 months
  for (let monthIndex = 1; monthIndex <= 12; monthIndex++) {
    const monthCondition = `--(MONTH(${transactionDate})=${monthIndex})`;

    const formula = {
      value: `=SUMPRODUCT(${transactionAmount},${monthCondition},${yearCondition},${categoryCondition},${typeCondition})`,
      format: { formula: true },
    };

    monthsFormulas.push(formula);
  }

  return monthsFormulas;
};

export const buildSummaryRow = (title: string, length: number, initRowIndex: number): RawCellValue[] => {
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

export const buildDifferenceRows = (totalSpendingRow: number, totalIncomeRow: number): RawCellValue[][] => {
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
