import type { SheetsRowData, SpreadsheetBorders } from './spreadsheet';

export interface SpreadsheetUpdateBordersRequest {
  updateBorders: SpreadsheetBorders;
}

export interface SpreadsheetUpdateCellsValueRequest {
  updateCells: {
    start: {
      sheetId: number;
      rowIndex: number;
      columnIndex: number;
    };
    rows: SheetsRowData[];
    fields: string;
  };
}

export interface UpdateSpreadsheetPropertiesRequest {
  updateSpreadsheetProperties: {
    properties: Record<string, unknown>;
    fields: string;
  };
}

export interface UpdateSheetPropertiesRequest {
  updateSheetProperties: {
    properties: Record<string, unknown>;
    fields: string;
  };
}

export interface SpreadsheetAddTableRquest {
  addTable: {
    table: {
      range: {
        sheetId: number;
        startRowIndex: number;
        endRowIndex: number;
        startColumnIndex: number;
        endColumnIndex: number;
      };
      name: string;
    };
  };
}

export interface SpreadsheetAddSheetRequest {
  addSheet: {
    properties: {
      title: string;
    };
  };
}

export interface SpreadsheetDeleteSheetRequest {
  deleteSheet: {
    sheetId: number;
  };
}

export interface SpreadsheetInsertDimensionRequest {
  insertDimension: {
    range: {
      sheetId: number;
      dimension: 'ROWS' | 'COLUMNS';
      startIndex: number;
      endIndex: number;
    };
    inheritFromBefore: boolean;
  };
}

export type BatchUpdateRequest =
  | SpreadsheetUpdateBordersRequest
  | SpreadsheetUpdateCellsValueRequest
  | UpdateSpreadsheetPropertiesRequest
  | UpdateSheetPropertiesRequest
  | SpreadsheetAddTableRquest
  | SpreadsheetAddSheetRequest
  | SpreadsheetDeleteSheetRequest
  | SpreadsheetInsertDimensionRequest;
