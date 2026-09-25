import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SheetsIDs } from '../types/spreadsheet';
import { SessionStatus } from '../types/auth';

export const useGoogleStore = defineStore(
  'google',
  () => {
    const spreadsheetId = ref<string | null>(null);
    const sheetsId = ref<SheetsIDs | null>(null);
    const sessionStatus = ref<SessionStatus>(SessionStatus.DISCONNECTED);

    const hasCachedSession = ref<boolean>(false);

    const resetValues = () => {
      spreadsheetId.value = null;
      sheetsId.value = null;
      hasCachedSession.value = false;
      sessionStatus.value = SessionStatus.DISCONNECTED;
    };

    const setSpreadsheetId = (id: string) => {
      spreadsheetId.value = id;
    };

    const setSheetsIDs = (ids: SheetsIDs) => {
      sheetsId.value = ids;
    };

    const setStatus = (status: SessionStatus) => {
      sessionStatus.value = status;
    };

    const handleError = () => {
      setStatus(hasCachedSession.value ? SessionStatus.OFFLINE : SessionStatus.ERROR);
    };

    return {
      hasCachedSession,
      spreadsheetId,
      sheetsId,
      sessionStatus,
      resetValues,
      setSpreadsheetId,
      setSheetsIDs,
      setStatus,
      handleError,
    };
  },
  {
    persist: {
      pick: ['spreadsheetId', 'hasCachedSession', 'sheetsId'],
    },
  },
);
