import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SheetsIDs, SpreadsheetStatus } from '../types/spreadsheet';
import { SessionStatus, type UserInfo } from '../types/auth';

export const useGoogleStore = defineStore(
  'google',
  () => {
    const spreadsheetId = ref<string | null>(null);
    const sheetsId = ref<SheetsIDs | null>(null);
    const sessionStatus = ref<SessionStatus>(SessionStatus.DISCONNECTED);
    const userInfo = ref<UserInfo | null>(null);
    const spreadsheetStatus = ref<SpreadsheetStatus | null>(null);

    const resetValues = () => {
      spreadsheetId.value = null;
      sheetsId.value = null;
      userInfo.value = null;
      spreadsheetStatus.value = null;
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

    return {
      spreadsheetId,
      sheetsId,
      sessionStatus,
      userInfo,
      spreadsheetStatus,
      resetValues,
      setSpreadsheetId,
      setSheetsIDs,
      setStatus,
    };
  },
  {
    persist: {
      pick: ['spreadsheetId', 'sheetsId', 'userInfo'],
    },
  },
);
