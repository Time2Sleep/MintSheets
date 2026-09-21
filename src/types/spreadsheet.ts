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

export interface SheetsCellData {
  userEnteredValue: {
    stringValue?: string;
    numberValue?: number;
  };
  userEnteredFormat?: {
    numberFormat?: {
      type: 'TEXT' | 'DATE';
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
  total: number;
  transactions: number;
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
