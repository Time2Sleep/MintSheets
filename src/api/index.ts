import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://sheets.googleapis.com/v4/spreadsheets',
  timeout: 10000,
});

export const setAuthorizationHeader = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    apiClient.defaults.headers.common.Accept = 'application/json';
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};
