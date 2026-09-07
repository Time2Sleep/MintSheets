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
      properties: {
        sheetId: number;
      };
    };
  }[];
}
