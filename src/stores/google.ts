import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  appendSpreadsheetRows,
  batchUpdateSpreadsheet,
  createSpreadsheet,
  findSpreadsheetById,
  findSpreadsheetByTitle,
} from '../api/sheets';
import { router } from '../router';
import { buildRenameSheetRequest, buildAddSheetRequest, buildBoldtextRequest } from '../utils/requestsFactory';

const LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME = 'mintsheets_spreadsheet_id';
const LOCAL_STORAGE_MINTS_WAS_CONNECTED = 'mints_was_connected';
let logoutTimer: ReturnType<typeof setTimeout> | undefined;

export const useGoogleStore = defineStore('google', () => {
  const googleToken = ref<string | null>(null);
  const spreadsheetId = ref<string | null>(localStorage.getItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME));

  const isAuthError = ref<boolean>(false);
  const isOffline = ref<boolean>(false);
  const isConnected = computed(() => !!googleToken.value);
  const mintsWasConnected = ref<boolean>(!!localStorage.getItem(LOCAL_STORAGE_MINTS_WAS_CONNECTED));

  const setGoogleToken = (token: string | null) => {
    googleToken.value = token;
    mintsWasConnected.value = true;
    localStorage.setItem(LOCAL_STORAGE_MINTS_WAS_CONNECTED, 'true');

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
      const foundById = await findSpreadsheetById(localId);

      if (foundById) {
        spreadsheetId.value = localId;
        return;
      }
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
      _initSpreadsheet(id);
    }

    localStorage.setItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME, id);
    spreadsheetId.value = id;
  };

  const _initSpreadsheet = async (id: string) => {
    try {
      const sheets = await batchUpdateSpreadsheet(id, [
        buildRenameSheetRequest(0, 'Total'),
        buildAddSheetRequest('Transactions'),
      ]);

      const totalHeaders = [['Initial Balance', '0'], [], ['Categories']];
      await appendSpreadsheetRows(id, 'Total!A1', totalHeaders);

      const transactionHeaders = [['Date', 'Type', 'Category', 'Amount', 'Comment']];
      await appendSpreadsheetRows(id, 'Transactions!A1', transactionHeaders);

      const transactionsSheetId = sheets.replies[1].addSheet.properties.sheetId;

      if (!transactionsSheetId) return;

      await batchUpdateSpreadsheet(id, [
        buildBoldtextRequest(0, 0, 3, 0, 1),
        buildBoldtextRequest(transactionsSheetId, 0, 1, 0, 5),
      ]);
    } catch (err) {
      console.warn('Error during spreadsheets initializtion', err);
    }
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
