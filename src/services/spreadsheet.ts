import {
  createSpreadsheet,
  batchUpdateSpreadsheet,
  getSheetsProperties,
  getSpreadsheetValues,
  findSpreadsheetById,
  findSpreadsheetByTitle,
} from '../api/sheets';
import { SPREADSHEET_SCHEMA } from '../schemas/spreadsheet';
import type { SheetsIDs, SpreadsheetStatus } from '../types/spreadsheet';
import {
  buildRenameSheetRequest,
  buildAddSheetRequest,
  buildUpdateCellsValueRequest,
  buildConvertToTableRequest,
  buildSetSpreadsheetLocaleRequest,
  buildDeleteSheetRequest,
} from '../utils/requestsFactory';

export const initSpreadsheet = async (title: string): Promise<string | false> => {
  try {
    const id = await createSpreadsheet(title);

    const isSetup = await setupSpreadsheet(id);

    return isSetup ? id : false;
  } catch (error) {
    console.warn('Failed to create spreadsheet', error);

    return false;
  }
};

export const setupSpreadsheet = async (id: string): Promise<boolean> => {
  try {
    const transactionsSheetId = await createSpreadsheetTab(id, SPREADSHEET_SCHEMA.transactionsTab.title);

    await batchUpdateSpreadsheet(id, [
      buildSetSpreadsheetLocaleRequest(SPREADSHEET_SCHEMA.locale),
      buildRenameSheetRequest(0, SPREADSHEET_SCHEMA.settingsTab.title), //rename first tab to 'Settings'
      buildUpdateCellsValueRequest(0, 0, 0, SPREADSHEET_SCHEMA.settingsTab.initialRows), //write init data to 'Settings'
      buildUpdateCellsValueRequest(transactionsSheetId, 0, 0, SPREADSHEET_SCHEMA.transactionsTab.initialRows), //write init data to 'Transactions'
      buildConvertToTableRequest(SPREADSHEET_SCHEMA.transactionsTab.title, transactionsSheetId), //convert raw data to table
    ]);

    return true;
  } catch (error) {
    console.warn('Failed to setup spreadsheet', error);

    return false;
  }
};

export const createSpreadsheetTab = async (id: string, tabName: string): Promise<number> => {
  const response = await batchUpdateSpreadsheet(id, [buildAddSheetRequest(tabName)]);

  return response.replies[0].addSheet.properties.sheetId;
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

  if (settingsId == null || transactionsId == null) {
    throw new Error('[Spreadsheet Service] Failed to receive sheets IDs.');
  }

  return {
    ...tabs,
    settings: settingsId,
    transactions: transactionsId,
  };
};

export const getSpreadsheetStatus = async (id: string): Promise<SpreadsheetStatus> => {
  const query = `${SPREADSHEET_SCHEMA.settingsTab.title}!${SPREADSHEET_SCHEMA.settingsTab.ranges.status}`;
  const values = await getSpreadsheetValues<SpreadsheetStatus>(id, query);

  return values[0]?.[0];
};

export const findOrCreateSpreadsheet = async (id: string | null, title: string): Promise<string> => {
  if (id) {
    const foundById = await findSpreadsheetById(id);

    if (foundById) {
      const status = await getSpreadsheetStatus(id);
      if (status) return id;
    }
  }

  const idByTitle = await findSpreadsheetByTitle(title);
  if (idByTitle) {
    const status = await getSpreadsheetStatus(idByTitle);

    if (status) {
      return idByTitle;
    }

    const isSetup = await setupSpreadsheet(idByTitle);
    if (isSetup) {
      return idByTitle;
    }
  }

  const newSpreadsheetId = await initSpreadsheet(title);

  if (!newSpreadsheetId) {
    throw new Error('Failed to initialize spreadsheet');
  }

  return newSpreadsheetId;
};
