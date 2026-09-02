import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { createSpreadsheet, findSpreadsheetByTitle } from '../api/sheets';

export const useGoogleStore = defineStore('google', () => {
  const googleToken = ref<string | null>(null);
  const spreadsheetId = ref<string | null>(null);
  const isAuthError = ref<boolean>(false);

  const isConnected = computed(() => !!googleToken.value);

  const setGoogleToken = (token: string | null) => {
    googleToken.value = token;
  };

  const logoutGoogle = () => {
    googleToken.value = null;
  };

  const findOrCreateSpreadsheet = async () => {
    const localId = localStorage.getItem('mints_spreadsheet_id');

    if (localId) {
      spreadsheetId.value = localId;
      return;
    }

    const title = 'MintSheets_financial_spreadsheet_MVP';

    let id = await findSpreadsheetByTitle(title);

    const doubleCheckId = localStorage.getItem('mints_spreadsheet_id');
    if (!id) {
      if (doubleCheckId) {
        spreadsheetId.value = doubleCheckId;
        return;
      }

      id = await createSpreadsheet(title);
    }

    localStorage.setItem('mints_spreadsheet_id', id);
    spreadsheetId.value = id;
    console.log('Spreadsheet ID:', id);
  };

  return {
    googleToken,
    isConnected,
    setGoogleToken,
    logoutGoogle,
    isAuthError,
    findOrCreateSpreadsheet,
  };
});
