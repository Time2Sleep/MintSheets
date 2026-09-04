import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { createSpreadsheet, findSpreadsheetByTitle } from '../api/sheets';
import { router } from '../router';

const LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME = 'mintsheets_spreadsheet_id';
let logoutTimer: ReturnType<typeof setTimeout> | undefined;

export const useGoogleStore = defineStore('google', () => {
  const googleToken = ref<string | null>(null);
  const spreadsheetId = ref<string | null>(localStorage.getItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME));

  const isAuthError = ref<boolean>(false);
  const isOffline = ref<boolean>(false);
  const isConnected = computed(() => !!googleToken.value);
  const mintsWasConnected = ref<boolean>(!!localStorage.getItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME));

  const setGoogleToken = (token: string | null) => {
    googleToken.value = token;
    mintsWasConnected.value = true;
    localStorage.setItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME, 'true');

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
    localStorage.removeItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME);
  };

  const findOrCreateSpreadsheet = async () => {
    const localId = localStorage.getItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME);

    if (localId) {
      spreadsheetId.value = localId;
      return;
    }

    const title = 'MintSheets_financial_spreadsheet_MVP';

    let id = await findSpreadsheetByTitle(title);

    const doubleCheckId = localStorage.getItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME);
    if (!id) {
      if (doubleCheckId) {
        spreadsheetId.value = doubleCheckId;
        return;
      }

      id = await createSpreadsheet(title);
    }

    localStorage.setItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME, id);
    spreadsheetId.value = id;
  };

  const turnOfflineModeOn = () => {
    isOffline.value = true;

    if (mintsWasConnected.value) {
      router.push({ name: 'main' });
    }
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
  };
});
