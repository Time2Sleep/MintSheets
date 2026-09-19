import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { router } from '../router';
import { findOrCreateSpreadsheet, getSpreadsheetTabsIDs } from '../services/spreadsheet';
import type { SheetsIDs } from '../types/api';
import { setAuthorizationHeader } from '../api';

let logoutTimer: ReturnType<typeof setTimeout> | undefined;

export const useGoogleStore = defineStore(
  'google',
  () => {
    const googleToken = ref<string | null>(null);
    const spreadsheetId = ref<string | null>(null);
    const sheetsId = ref<SheetsIDs | null>(null);

    const isAuthError = ref<boolean>(false);
    const isOffline = ref<boolean>(false);
    const isConnected = computed(() => !!googleToken.value);
    const mintsWasConnected = ref<boolean>(false);
    const connecting = ref<boolean>(false);

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
      sheetsId.value = null;
      mintsWasConnected.value = false;
      setAuthorizationHeader(null);
    };

    const connectSpreadsheet = async (): Promise<string> => {
      connecting.value = true;

      try {
        const title = 'MintSheets_financial_spreadsheet_MVP';

        spreadsheetId.value = await findOrCreateSpreadsheet(spreadsheetId.value, title);

        return spreadsheetId.value;
      } finally {
        connecting.value = false;
      }
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

      return sheetsId.value;
    };

    return {
      googleToken,
      isConnected,
      setGoogleToken,
      logoutGoogle,
      isAuthError,
      isOffline,
      connectSpreadsheet,
      mintsWasConnected,
      turnOfflineModeOn,
      spreadsheetId,
      sheetsId,
      getSheetsIDs,
      connecting,
    };
  },
  {
    persist: {
      pick: ['spreadsheetId', 'mintsWasConnected', 'sheetsId'],
    },
  },
);
