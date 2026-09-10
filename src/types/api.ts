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

export interface GoogleDriveFilesReponse {
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

export interface SheetsRowData {
  values: {
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
  }[];
}
