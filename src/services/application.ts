import { useGoogleStore } from '../stores/google';
import { router } from '../router';
import { findOrCreateSpreadsheet, getSpreadsheetStatus, getSpreadsheetTabsIDs } from './spreadsheet';
import { getFinanceStore } from '../stores/financeStoreRegistry';
import { setAuthorizationHeader } from '../api';
import { SpreadsheetStatus } from '../types/spreadsheet';
import { SessionStatus } from '../types/auth';
import { initializeGoogleAuth, loadGoogleSDK } from './googleAuth';
import { SPREADSHEET_SCHEMA } from '../schemas/spreadsheet';

let logoutTimer: ReturnType<typeof setTimeout> | undefined;

export const initializeAuth = async () => {
  const googleStore = useGoogleStore();

  const handleAuthError = (error: Error) => {
    console.warn('[Auth] Google authentication failed:', error);

    googleStore.setStatus(googleStore.mintsWasConnected ? SessionStatus.OFFLINE : SessionStatus.ERROR);
  };

  try {
    await loadGoogleSDK();
    initializeGoogleAuth(initializeUserSession, handleAuthError);
  } catch (error) {
    handleAuthError(error instanceof Error ? error : new Error(String(error)));
  }
};

export const initializeUserSession = async (token: string) => {
  const googleStore = useGoogleStore();
  googleStore.setStatus(SessionStatus.INITIALIZING);

  setAuthorizationHeader(token);
  if (logoutTimer) {
    clearTimeout(logoutTimer);
  }
  logoutTimer = setTimeout(logout, 10 * 60 * 1000);

  try {
    console.log('[App] initializing cloud spreadsheet...');
    const spreadsheetId = await findOrCreateSpreadsheet(googleStore.spreadsheetId, SPREADSHEET_SCHEMA.title);
    googleStore.setSpreadsheetId(spreadsheetId);
    console.log('[App] Cloud spreadsheet successfully linked to session!');

    const sheets = await getSpreadsheetTabsIDs(spreadsheetId);
    googleStore.setSheetsIDs(sheets);

    const spreadsheetStatus = await getSpreadsheetStatus(spreadsheetId);

    if (spreadsheetStatus === SpreadsheetStatus.DRAFT) {
      googleStore.setStatus(SessionStatus.READY);
      router.push({ name: 'settings' });

      return;
    }

    if (spreadsheetStatus === SpreadsheetStatus.ACTIVE) {
      const context = {
        spreadsheetId,
        sheets,
      };

      const financeStore = getFinanceStore(context);

      await financeStore.getSettings();
      await financeStore.syncLocalTransactions();

      googleStore.setStatus(SessionStatus.READY);
      googleStore.mintsWasConnected = true;

      router.push({ name: 'main' });

      return;
    }

    throw new Error('Something went wrong during spreadsheet initialization');
  } catch (error) {
    console.warn('[App] Critical error while preparing spreadsheet:', error);
    googleStore.setStatus(SessionStatus.ERROR);
  }
};

const logout = () => {
  if (logoutTimer) {
    clearTimeout(logoutTimer);
    logoutTimer = undefined;
  }

  const googleStore = useGoogleStore();
  googleStore.resetValues();
  setAuthorizationHeader(null);
  router.push({ name: 'auth' });
};
