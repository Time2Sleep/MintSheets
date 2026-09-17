import axios from 'axios';
import { apiClient } from '.';
import type {
  AppendValuesResponse,
  BatchUpdateResponse,
  CreateSpreadsheetResponse,
  GetSheetPropertiesResponse,
  GoogleDriveFilesResponse,
  SpreadsheetValue,
} from '../types/api';

export const findSpreadsheetByTitle = async (title: string): Promise<string | null> => {
  const escapedTitle = title.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const query = `name = '${escapedTitle}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`;

  const response = await apiClient.get<GoogleDriveFilesResponse>('https://www.googleapis.com/drive/v3/files', {
    params: {
      q: query,
      fields: 'files(id)',
    },
  });

  const files = response.data.files;
  return files && files.length > 0 ? files[0].id : null;
};

export const findSpreadsheetById = async (spreadsheetId: string): Promise<string | null> => {
  try {
    const response = await apiClient.get<{ spreadsheetId: string }>(`/${spreadsheetId}`);
    return response.data.spreadsheetId;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }

    throw err;
  }
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

export const getSpreadsheetValues = async <T extends SpreadsheetValue>(
  spreadsheetId: string,
  range: string,
  formatted = false,
): Promise<T[][]> => {
  const response = await apiClient.get<{ values: T[][] }>(`/${spreadsheetId}/values/${range}`, {
    params: {
      valueRenderOption: formatted ? 'FORMATTED_VALUE' : 'UNFORMATTED_VALUE',
    },
  });
  return response.data.values || [];
};

export const getSheetsProperties = async (spreadsheetId: string): Promise<GetSheetPropertiesResponse> => {
  const response = await apiClient.get<GetSheetPropertiesResponse>(`/${spreadsheetId}?&fields=sheets.properties`);
  return response.data;
};
