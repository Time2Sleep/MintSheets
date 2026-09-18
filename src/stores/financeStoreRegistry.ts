import { useGoogleStore } from './google';
import { createFinanceStore } from './finances';

const financeStores = new Map<string, ReturnType<typeof createFinanceStore>>();

export const useCurrentFinanceStore = () => {
  const googleStore = useGoogleStore();

  if (!googleStore.spreadsheetId) {
    throw new Error('Finance store is not available');
  }

  return getFinanceStore(googleStore.spreadsheetId);
};

export const getFinanceStore = (spreadsheetId: string) => {
  let useFinanceStore = financeStores.get(spreadsheetId);

  if (!useFinanceStore) {
    useFinanceStore = createFinanceStore(spreadsheetId);
    financeStores.set(spreadsheetId, useFinanceStore);
  }

  return useFinanceStore();
};
