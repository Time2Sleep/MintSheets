import type { GridRange, RawCellValue, SheetsCellData, SheetsRowData } from '../types/spreadsheet';
import { buildBoldCell, buildCell, buildFormula } from './requestsFactory';

export const toSheetsRowData = (data: readonly RawCellValue[]): SheetsRowData => {
  const values: SheetsCellData[] = data.reduce((acc, cell) => {
    if (typeof cell === 'object') {
      if (cell.format?.formula && typeof cell.value === 'string') {
        return [...acc, buildFormula(cell.value)];
      }

      const value = cell.format?.bold ? buildBoldCell(cell.value) : buildCell(cell.value);
      if (cell.format?.date) {
        value.userEnteredFormat = { numberFormat: { type: 'DATE', pattern: 'yyyy-MM-dd' } };
      }

      return [...acc, value];
    }

    return [...acc, buildCell(cell)];
  }, [] as SheetsCellData[]);

  return { values };
};

export const columnToIndex = (column: string): number => {
  let index = 0;

  for (const char of column) {
    index = index * 26 + (char.charCodeAt(0) - 64);
  }

  return index - 1;
};

const parseA1Cell = (cell: string) => {
  const match = cell.match(/^([A-Z]+)(\d+)$/);

  if (!match) {
    throw new Error(`Invalid A1 cell: ${cell}`);
  }

  return {
    column: match[1],
    row: Number(match[2]),
  };
};

export const a1RangeToGridRange = (range: string): Omit<GridRange, 'sheetId'> => {
  const [startCell, endCell] = range.split(':');

  const start = parseA1Cell(startCell);
  const end = parseA1Cell(endCell);

  return {
    startColumnIndex: columnToIndex(start.column),
    startRowIndex: start.row - 1,
    endColumnIndex: columnToIndex(end.column) + 1,
    endRowIndex: end.row,
  };
};
