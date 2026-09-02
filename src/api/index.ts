import axios from 'axios';
import { useGoogleStore } from '../stores/google';

export const apiClient = axios.create({
  baseURL: 'https://sheets.googleapis.com/v4/spreadsheets',
});

apiClient.interceptors.request.use(
  (config) => {
    const googleStore = useGoogleStore();
    const accessToken = googleStore.googleToken;

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      config.headers.Accept = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error),
);
