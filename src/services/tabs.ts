import { batchUpdateSpreadsheet, getSheetsProperties } from '../api/sheets';
import { SPREADSHEET_SCHEMA } from '../schemas/spreadsheet';
import type { SheetsIDs } from '../types/spreadsheet';
import { buildAddSheetRequest, buildDeleteRowsRequest, buildDeleteSheetRequest } from '../utils/requestsFactory';

export const createSpreadsheetTabs = async (id: string, tabsName: string | string[]): Promise<number[]> => {
  const isArray = Array.isArray(tabsName);

  let requests;

  if (isArray) requests = tabsName.map((title) => buildAddSheetRequest(title));
  else requests = [buildAddSheetRequest(tabsName)];

  const response = await batchUpdateSpreadsheet(id, requests);

  return response.replies.map((reply) => reply.addSheet.properties.sheetId);
};

export const deleteSpreadsheetTab = async (id: string, tabId: number): Promise<void> => {
  await batchUpdateSpreadsheet(id, [buildDeleteSheetRequest(tabId)]);
};

export const getSpreadsheetTabsIDs = async (id: string): Promise<SheetsIDs> => {
  const { sheets } = await getSheetsProperties(id);

  const tabs = sheets.reduce(
    (acc, { properties }) => {
      const key = properties.title.toLowerCase();
      acc[key] = properties.sheetId;

      return acc;
    },
    {} as Record<string, number>,
  );

  const settingsId = tabs[SPREADSHEET_SCHEMA.settingsTab.key];
  const transactionsId = tabs[SPREADSHEET_SCHEMA.transactionsTab.key];
  const analyticsId = tabs[SPREADSHEET_SCHEMA.analytics.key];

  if (settingsId == null || transactionsId == null || analyticsId == null) {
    throw new Error('[Spreadsheet Service] Failed to receive sheets IDs.');
  }

  return {
    ...tabs,
    settings: settingsId,
    transactions: transactionsId,
    analytics: analyticsId,
  };
};

export const deleteRowsFromSpreadsheet = async (
  spreadsheetId: string,
  tabId: number,
  startRow: number,
  count: number,
) => {
  await batchUpdateSpreadsheet(spreadsheetId, [buildDeleteRowsRequest(tabId, startRow, startRow + count)]);
};
