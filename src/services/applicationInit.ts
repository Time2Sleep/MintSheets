import { useGoogleStore } from '../stores/google';
import { router } from '../router';
import { getSpreadsheetStatus } from './spreadsheet';
import { getFinanceStore } from '../stores/financeStoreRegistry';

export const initializeUserSession = async (token: string) => {
  const googleStore = useGoogleStore();
  googleStore.setGoogleToken(token);
  googleStore.isAuthError = false;

  try {
    console.log('[App] initializing cloud spreadsheet...');
    const spreadsheetId = await googleStore.findOrCreateSpreadsheet();
    console.log('[App] Cloud spreadsheet successfully linked to session!');

    await googleStore.getSheetsIDs();

    const spreadsheetStatus = await getSpreadsheetStatus(spreadsheetId);

    if (spreadsheetStatus === 'draft') {
      router.push({ name: 'settings' });
    } else if (spreadsheetStatus === 'active') {
      const financeStore = getFinanceStore(spreadsheetId);

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
