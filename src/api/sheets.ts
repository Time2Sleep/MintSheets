import { apiClient } from '.';
import type {
  AppendValuesResponse,
  BatchUpdateResponse,
  CreateSpreadsheetResponse,
  GoogleDriveFilesReponse,
} from '../types/api';

export const findSpreadsheetByTitle = async (title: string): Promise<string | null> => {
  const escapedTitle = title.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const query = `name = '${escapedTitle}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;

  const response = await apiClient.get<GoogleDriveFilesReponse>('https://www.googleapis.com/drive/v3/files', {
    params: {
      q: query,
      fields: 'files(id)',
    },
  });

  const files = response.data.files;
  return files && files.length > 0 ? files[0].id : null;
};

export const findSpreadsheetById = async (spreadsheetId: string): Promise<string | null> => {
  const response = await apiClient.get<{ spreadsheetId: string }>(`/${spreadsheetId}`);

  return response.data.spreadsheetId;
};

export const createSpreadsheet = async (title: string): Promise<string> => {
  const response = await apiClient.post<CreateSpreadsheetResponse>('/', {
    properties: {
      title,
    },
  });

  return response.data.spreadsheetId;
};

export const batchUpdateSpreadsheet = async (
  spreadsheetId: string,
  requests: Record<string, unknown>[],
): Promise<BatchUpdateResponse> => {
  const response = await apiClient.post<BatchUpdateResponse>(`/${spreadsheetId}:batchUpdate`, { requests });

  return response.data;
};

export const appendSpreadsheetRows = async (
  spreadsheetId: string,
  range: string,
  values: string[][],
): Promise<AppendValuesResponse> => {
  const response = await apiClient.post<AppendValuesResponse>(
    `/${spreadsheetId}/values/${range}:append`,
    {
      values,
    },
    {
      params: {
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
      },
    },
  );
  return response.data;
};
