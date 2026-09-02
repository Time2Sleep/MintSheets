import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { createSpreadsheet, findSpreadsheetByTitle } from '../api/sheets';

export const useGoogleStore = defineStore('google', () => {
  const googleToken = ref<string | null>(null);
  const isAuthError = ref<boolean>(false);

  const isConnected = computed(() => !!googleToken.value);

  const setGoogleToken = (token: string | null) => {
    googleToken.value = token;
  };

  const logoutGoogle = () => {
    googleToken.value = null;
  };

  const findOrCreateSpreadsheet = async () => {
    const title = 'MintSheets_financial_spreadsheet_MVP';

    let spreadsheetId = await findSpreadsheetByTitle(title);

    if (!spreadsheetId) {
      spreadsheetId = await createSpreadsheet(title);
    }

    console.log('Spreadsheet ID:', spreadsheetId);
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
