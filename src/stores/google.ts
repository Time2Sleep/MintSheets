import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { findSpreadsheetById, findSpreadsheetByTitle } from '../api/sheets';
import { router } from '../router';
import { getSpreadsheetTabsIDs, initSpreadsheet } from '../services/spreadsheet';

let logoutTimer: ReturnType<typeof setTimeout> | undefined;

export const useGoogleStore = defineStore(
  'google',
  () => {
    const googleToken = ref<string | null>(null);
    const spreadsheetId = ref<string | null>(null);
    const sheetsId = ref<Record<string, number>>({});

    const isAuthError = ref<boolean>(false);
    const isOffline = ref<boolean>(false);
    const isConnected = computed(() => !!googleToken.value);
    const mintsWasConnected = ref<boolean>(false);

    const setGoogleToken = (token: string | null) => {
      googleToken.value = token;
      mintsWasConnected.value = true;

      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }

      logoutTimer = setTimeout(logoutGoogle, 10 * 60 * 1000);
    };

    const logoutGoogle = () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
        logoutTimer = undefined;
      }

      googleToken.value = null;
      spreadsheetId.value = null;
      sheetsId.value = {};
      mintsWasConnected.value = false;
    };

    const findOrCreateSpreadsheet = async (): Promise<string> => {
      if (spreadsheetId.value) {
        const foundById = await findSpreadsheetById(spreadsheetId.value);

        if (foundById) return spreadsheetId.value;
      }

      const title = 'MintSheets_financial_spreadsheet_MVP';
      const id = await findSpreadsheetByTitle(title);
      if (id) {
        spreadsheetId.value = id;
        return id;
      }

      const newSpreadsheetId = await initSpreadsheet(title);

      if (!newSpreadsheetId) {
        isAuthError.value = true;
        return Promise.reject(new Error('Failed to initialize spreadsheet'));
      }

      spreadsheetId.value = newSpreadsheetId;
      return newSpreadsheetId;
    };

    const turnOfflineModeOn = () => {
      isOffline.value = true;

      if (mintsWasConnected.value) {
        router.push({ name: 'main' });
      }
    };

    const getSheetsIDs = async () => {
      if (!spreadsheetId.value) throw new Error('Spreadsheet ID is missing!');

      sheetsId.value = await getSpreadsheetTabsIDs(spreadsheetId.value);
    };

    return {
      googleToken,
      isConnected,
      setGoogleToken,
      logoutGoogle,
      isAuthError,
      isOffline,
      findOrCreateSpreadsheet,
      mintsWasConnected,
      turnOfflineModeOn,
      spreadsheetId,
      sheetsId,
      getSheetsIDs,
    };
  },
  {
    persist: {
      pick: ['spreadsheetId', 'sheetsId', 'mintsWasConnected'],
    },
  },
);
