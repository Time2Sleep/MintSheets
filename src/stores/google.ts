import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  appendSpreadsheetRows,
  batchUpdateSpreadsheet,
  createSpreadsheet,
  findSpreadsheetById,
  findSpreadsheetByTitle,
  getSheetsProperties,
} from '../api/sheets';
import { router } from '../router';
import { buildRenameSheetRequest, buildAddSheetRequest, buildBoldtextRequest } from '../utils/requestsFactory';

const LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME = 'mintsheets_spreadsheet_id';
const LOCAL_STORAGE_MINTS_WAS_CONNECTED = 'mints_was_connected';
let logoutTimer: ReturnType<typeof setTimeout> | undefined;

export const useGoogleStore = defineStore('google', () => {
  const googleToken = ref<string | null>(null);
  const spreadsheetId = ref<string | null>(localStorage.getItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME));
  const sheetsId = ref<Record<string, number>>({ total: 0 });

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
    sheetsId.value = { total: 0 };
    localStorage.removeItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME);
  };

  const findOrCreateSpreadsheet = async (): Promise<string> => {
    const localId = localStorage.getItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME);

    if (localId) {
      const foundById = await findSpreadsheetById(localId);

      if (foundById) {
        spreadsheetId.value = localId;
        return localId;
      }

      localStorage.removeItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME);
    }

    const title = 'MintSheets_financial_spreadsheet_MVP';

    let id = await findSpreadsheetByTitle(title);

    const doubleCheckId = localStorage.getItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME);
    if (!id) {
      if (doubleCheckId) {
        spreadsheetId.value = doubleCheckId;
        return doubleCheckId;
      }

      id = await createSpreadsheet(title);

      const initialized = await _initSpreadsheet(id);

      if (!initialized) {
        isAuthError.value = true;
        return Promise.reject(new Error('Failed to initialize spreadsheet'));
      }
    }

    localStorage.setItem(LOCAL_STORAGE_SPREADHEET_ID_VAR_NAME, id);
    spreadsheetId.value = id;
    return id;
  };

  const _initSpreadsheet = async (id: string): Promise<boolean> => {
    try {
      const sheets = await batchUpdateSpreadsheet(id, [
        buildRenameSheetRequest(0, 'Total'),
        buildAddSheetRequest('Transactions'),
      ]);

      const totalHeaders = [['Initial Balance', '0'], [], ['Categories']];
      await appendSpreadsheetRows(id, 'Total!A1', totalHeaders);

      const transactionHeaders = [['ID', 'Date', 'Type', 'Category', 'Amount', 'Comment']];
      await appendSpreadsheetRows(id, 'Transactions!A1', transactionHeaders);

      const transactionsSheetId = sheets.replies[1].addSheet.properties.sheetId;

      if (!transactionsSheetId) return false;

      sheetsId.value.transactions = transactionsSheetId;

      await batchUpdateSpreadsheet(id, [
        buildBoldtextRequest(0, 0, 3, 0, 1),
        buildBoldtextRequest(transactionsSheetId, 0, 1, 0, 5),
      ]);

      return true;
    } catch (err) {
      console.warn('Error during spreadsheets initializtion', err);

      return false;
    }
  };

  const getSheetsData = async () => {
    if (!spreadsheetId.value) return;

    const properties = await getSheetsProperties(spreadsheetId.value);

    sheetsId.value = properties.sheets.reduce(
      (acc, { properties }) => {
        acc[properties.title.toLowerCase()] = properties.sheetId;

        return acc;
      },
      {} as Record<string, number>,
    );
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
    spreadsheetId,
    sheetsId,
    getSheetsData,
  };
});
