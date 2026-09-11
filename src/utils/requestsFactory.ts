import type { SheetsRowData } from '../types/api';

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

export const buildRange = (
  sheetId: number,
  startRow: number,
  endRow: number,
  startColumn: number,
  endColumn: number,
) => ({
  sheetId,
  startRowIndex: startRow,
  endRowIndex: endRow,
  startColumnIndex: startColumn,
  endColumnIndex: endColumn,
});

export const buildBoldCell = (text: string | number) => {
  const userEnteredValue = typeof text === 'string' ? { stringValue: text } : { numberValue: text };

  return { userEnteredValue, userEnteredFormat: { textFormat: { bold: true } } };
};

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

export const buildUpdateCellsValueRequest = (sheetId: number, rowIndex: number, rows: SheetsRowData[]) => ({
  updateCells: {
    start: {
      sheetId,
      rowIndex,
      columnIndex: 0,
    },
    rows,
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
