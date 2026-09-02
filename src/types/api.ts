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
