import { useGoogleStore } from './google';
import { createFinanceStore } from './finances';
import type { SpreadsheetContext } from '../types/api';

const financeStores = new Map<string, ReturnType<typeof createFinanceStore>>();

export const useCurrentFinanceStore = () => {
  const googleStore = useGoogleStore();

  if (!googleStore.spreadsheetId || !googleStore.sheetsId) {
    throw new Error('Finance store is not available');
  }

  const context = {
    spreadsheetId: googleStore.spreadsheetId,
    sheets: googleStore.sheetsId,
  };
  return getFinanceStore(context);
};

export const getFinanceStore = (context: SpreadsheetContext) => {
  let useFinanceStore = financeStores.get(context.spreadsheetId);

  if (!useFinanceStore) {
    useFinanceStore = createFinanceStore(context);
    financeStores.set(context.spreadsheetId, useFinanceStore);
  }

  return useFinanceStore();
};
