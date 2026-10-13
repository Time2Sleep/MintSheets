import { computed, ref } from 'vue';
import { getSheetsProperties, getSpreadsheetValues } from '../api/sheets';
import type { SheetProperties, SpreadsheetValue } from '../types/spreadsheet';

export const useImportData = () => {
  const spreadsheetId = ref('');
  const tabs = ref<SheetProperties[]>([]);
  const rawData = ref<SpreadsheetValue[][]>([]);

  const setSpreadsheetId = (id: string) => {
    spreadsheetId.value = id;
  };

  const getTabs = async () => {
    const { sheets } = await getSheetsProperties(spreadsheetId.value);
    tabs.value = sheets.map(({ properties }) => properties);

    return tabs.value;
  };

  const getRawValuesFromTab = async (tabTitle: string) => {
    rawData.value = await getSpreadsheetValues(spreadsheetId.value, tabTitle);

    return rawData.value;
  };

  const numberOfRawDataColums = computed(() =>
    rawData.value.reduce((acc, row) => (row.length > acc ? row.length : acc), 0),
  );

  return {
    setSpreadsheetId,
    getTabs,
    getRawValuesFromTab,
    rawData,
    numberOfRawDataColums,
    tabs,
  };
};
