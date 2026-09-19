import { useGoogleStore } from '../stores/google';
import { router } from '../router';
import { getSpreadsheetStatus } from './spreadsheet';
import { getFinanceStore } from '../stores/financeStoreRegistry';
import { setAuthorizationHeader } from '../api';

export const initializeUserSession = async (token: string) => {
  const googleStore = useGoogleStore();
  googleStore.setGoogleToken(token);
  googleStore.isAuthError = false;

  setAuthorizationHeader(token);

  try {
    console.log('[App] initializing cloud spreadsheet...');
    const spreadsheetId = await googleStore.connectSpreadsheet();
    console.log('[App] Cloud spreadsheet successfully linked to session!');

    const sheets = await googleStore.getSheetsIDs();
    const spreadsheetStatus = await getSpreadsheetStatus(spreadsheetId);

    if (spreadsheetStatus === 'draft') {
      router.push({ name: 'settings' });
    } else if (spreadsheetStatus === 'active') {
      const context = {
        spreadsheetId,
        sheets,
      };

      const financeStore = getFinanceStore(context);

      await financeStore.getSettings();
      await financeStore.syncLocalTransactions();

      router.push({ name: 'main' });
    } else {
      throw new Error('Something went wrong during spreadsheet initialization');
    }
  } catch (error) {
    console.warn('[App] Critical error while preparing spreadsheet:', error);
    googleStore.isAuthError = true;
  }
};
