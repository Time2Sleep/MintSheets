import type { RawCellValue, SchemaBorders, SpreadsheetBorders } from '../types/spreadsheet';
import { a1RangeToGridRange, toSheetsRowData } from './convert';

export const buildRenameSheetRequest = (sheetId: number, newTitle: string) => ({
  updateSheetProperties: {
    properties: {
      sheetId,
      title: newTitle,
    },
    fields: 'title',
  },
});

export const buildAddSheetRequest = (title: string) => ({
  addSheet: {
    properties: {
      title,
    },
  },
});

export const buildDeleteSheetRequest = (sheetId: number) => ({
  deleteSheet: {
    sheetId,
  },
});

export const buildInsertRowRequest = (sheetId: number, startIndex: number, endIndex: number) => ({
  insertDimension: {
    range: {
      sheetId,
      dimension: 'ROWS',
      startIndex,
      endIndex,
    },
    inheritFromBefore: false,
  },
});

export const buildUpdateCellsValueRequest = (
  sheetId: number,
  rowIndex: number,
  columnIndex: number,
  rows: readonly (readonly RawCellValue[])[],
) => ({
  updateCells: {
    start: {
      sheetId,
      rowIndex,
      columnIndex,
    },
    rows: rows.map(toSheetsRowData),
    fields: 'userEnteredValue,userEnteredFormat',
  },
});

export const buildConvertToTableRequest = (
  name: string,
  sheetId: number,
  startRowIndex = 0,
  endRowIndex = 2,
  startColumnIndex = 0,
  endColumnIndex = 6,
) => ({
  addTable: {
    table: {
      range: {
        sheetId,
        startRowIndex,
        endRowIndex,
        startColumnIndex,
        endColumnIndex,
      },
      name,
    },
  },
});

export const buildSetSpreadsheetLocaleRequest = (locale: string) => ({
  updateSpreadsheetProperties: {
    properties: {
      locale,
    },
    fields: 'locale',
  },
});

export const buildUpdateBordersRequest = (
  sheetId: number,
  borders: SchemaBorders,
): { updateBorders: SpreadsheetBorders } => ({
  updateBorders: {
    range: {
      sheetId,
      ...a1RangeToGridRange(borders.range),
    },
    top: borders.top ? { style: borders.top } : undefined,
    bottom: borders.bottom ? { style: borders.bottom } : undefined,
    right: borders.right ? { style: borders.right } : undefined,
    left: borders.left ? { style: borders.left } : undefined,
  },
});
