import type {
  SpreadsheetAddSheetRequest,
  SpreadsheetAddTableRquest,
  SpreadsheetDeleteSheetRequest,
  SpreadsheetInsertDimensionRequest,
  SpreadsheetUpdateCellsValueRequest,
  UpdateSheetPropertiesRequest,
  UpdateSpreadsheetPropertiesRequest,
} from '../types/requests';
import type { RawCellValue, SchemaBorders, SpreadsheetBorders } from '../types/spreadsheet';
import { a1RangeToGridRange, toSheetsRowData } from './convert';

export const buildRenameSheetRequest = (sheetId: number, newTitle: string): UpdateSheetPropertiesRequest => ({
  updateSheetProperties: {
    properties: {
      sheetId,
      title: newTitle,
    },
    fields: 'title',
  },
});

export const buildAddSheetRequest = (title: string): SpreadsheetAddSheetRequest => ({
  addSheet: {
    properties: {
      title,
    },
  },
});

export const buildDeleteSheetRequest = (sheetId: number): SpreadsheetDeleteSheetRequest => ({
  deleteSheet: {
    sheetId,
  },
});

export const buildInsertRowRequest = (
  sheetId: number,
  startIndex: number,
  endIndex: number,
): SpreadsheetInsertDimensionRequest => ({
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
): SpreadsheetUpdateCellsValueRequest => ({
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
): SpreadsheetAddTableRquest => ({
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

export const buildSetSpreadsheetLocaleRequest = (locale: string): UpdateSpreadsheetPropertiesRequest => ({
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
