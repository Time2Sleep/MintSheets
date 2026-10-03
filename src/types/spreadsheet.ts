import { SPREADSHEET_SCHEMA } from '../schemas/spreadsheet';

export interface CreateSpreadsheetResponse {
  spreadsheetId: string;
  spreadsheetUrl: string;
  properties: {
    title: string;
  };
}

export interface GoogleDriveFile {
  id: string;
}

export interface GoogleDriveFilesResponse {
  files: GoogleDriveFile[];
}

export interface AppendValuesResponse {
  spreadsheetId: string;
  tableRange: string;
  updates: {
    spreadsheetId: string;
    updatedRange: string;
    updatedRows: number;
    updatedColumns: number;
    updatedCells: number;
  };
}

export interface BatchUpdateResponse {
  spreadsheetId: string;
  replies: {
    addSheet: {
      properties: SheetProperties;
    };
  }[];
}

export interface SheetProperties {
  sheetId: number;
  title: string;
}

export interface GetSheetPropertiesResponse {
  sheets: { properties: SheetProperties }[];
}

export type CellNumberFormat = 'TEXT' | 'DATE' | 'NUMBER' | 'PERCENT';

export interface SheetsCellData {
  userEnteredValue: {
    stringValue?: string;
    numberValue?: number;
    formulaValue?: string;
  };
  userEnteredFormat?: {
    numberFormat?: {
      type: CellNumberFormat;
      pattern?: string;
    };
    textFormat?: {
      bold?: boolean;
      italic?: boolean;
    };
  };
}

export interface SheetsRowData {
  values: SheetsCellData[];
}

export type SpreadsheetValue = string | number | boolean | null;

export interface SheetsIDs {
  [SPREADSHEET_SCHEMA.settingsTab.key]: number;
  [SPREADSHEET_SCHEMA.transactionsTab.key]: number;
  [key: string]: number;
}

export interface SpreadsheetContext {
  spreadsheetId: string;
  sheets: SheetsIDs;
}

export const SpreadsheetStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
} as const;

export type SpreadsheetStatus = null | (typeof SpreadsheetStatus)[keyof typeof SpreadsheetStatus];

export type RawCellValue =
  | string
  | number
  | {
      value: string | number;
      format?: {
        bold?: boolean;
        formula?: boolean;
        numberFormat?: CellNumberFormat;
      };
      pattern?: string;
    };

export interface GridRange {
  sheetId: number;
  startRowIndex: number;
  endRowIndex: number;
  startColumnIndex: number;
  endColumnIndex: number;
}

export interface SpreadsheetCellBorder {
  style: 'DOUBLE' | 'SOLID';
}

export interface SchemaBorders {
  range: string;
  right?: SpreadsheetCellBorder['style'];
  left?: SpreadsheetCellBorder['style'];
  bottom?: SpreadsheetCellBorder['style'];
  top?: SpreadsheetCellBorder['style'];
}

export interface SpreadsheetBorders {
  range: GridRange;
  right?: SpreadsheetCellBorder;
  left?: SpreadsheetCellBorder;
  bottom?: SpreadsheetCellBorder;
  top?: SpreadsheetCellBorder;
}

export interface SpreadsheetUpdateBordersRequest {
  updateBorders: SpreadsheetBorders;
}
