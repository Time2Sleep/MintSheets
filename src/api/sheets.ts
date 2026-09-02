import { apiClient } from '.';
import type { CreateSpreadsheetResponse, GoogleDriveFilesReponse } from '../types/api';

export const findSpreadsheetByTitle = async (title: string): Promise<string | null> => {
  const query = `name = '${title}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;

  const response = await apiClient.get<GoogleDriveFilesReponse>('https://www.googleapis.com/drive/v3/files', {
    params: {
      q: query,
      fields: 'files(id)',
    },
  });

  const files = response.data.files;
  return files && files.length > 0 ? files[0].id : null;
};

export const createSpreadsheet = async (title: string): Promise<string> => {
  const response = await apiClient.post<CreateSpreadsheetResponse>('/', {
    properties: {
      title,
    },
  });

  return response.data.spreadsheetId;
};
