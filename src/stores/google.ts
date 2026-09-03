import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { createSpreadsheet, findSpreadsheetByTitle } from '../api/sheets';
import { router } from '../router';

export const useGoogleStore = defineStore('google', () => {
  const googleToken = ref<string | null>(null);
  const spreadsheetId = ref<string | null>(localStorage.getItem('mintsheets_spreadsheet_id'));

  const isAuthError = ref<boolean>(false);
  const isOffline = ref<boolean>(false);
  const isConnected = computed(() => !!googleToken.value);
  const mintsWasConnected = ref<boolean>(!!localStorage.getItem('mintsheets_was_connected'));

  const setGoogleToken = (token: string | null) => {
    googleToken.value = token;
    mintsWasConnected.value = true;
    localStorage.setItem('mintsheets_was_connected', 'true');

    setTimeout(logoutGoogle, 10 * 60 * 1000); // Logout after 10 minutes
  };

  const logoutGoogle = () => {
    googleToken.value = null;
    spreadsheetId.value = null;
    localStorage.removeItem('mintsheets_spreadsheet_id');
  };

  const findOrCreateSpreadsheet = async () => {
    const localId = localStorage.getItem('mintsheets_spreadsheet_id');

    if (localId) {
      spreadsheetId.value = localId;
      return;
    }

    const title = 'MintSheets_financial_spreadsheet_MVP';

    let id = await findSpreadsheetByTitle(title);

    const doubleCheckId = localStorage.getItem('mintsheets_spreadsheet_id');
    if (!id) {
      if (doubleCheckId) {
        spreadsheetId.value = doubleCheckId;
        return;
      }

      id = await createSpreadsheet(title);
    }

    localStorage.setItem('mintsheets_spreadsheet_id', id);
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
