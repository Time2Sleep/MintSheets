import {
  createSpreadsheet,
  batchUpdateSpreadsheet,
  getSheetsProperties,
  getSpreadsheetValues,
  findSpreadsheetById,
  findSpreadsheetByTitle,
} from '../api/sheets';
import type { SheetsIDs, SheetsRowData } from '../types/api';
import {
  buildRenameSheetRequest,
  buildAddSheetRequest,
  buildBoldCell,
  buildUpdateCellsValueRequest,
  buildConvertToTableRequest,
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
    await batchUpdateSpreadsheet(id, [buildRenameSheetRequest(0, 'Total')]); //rename first tab to 'Total'
    const transactionsSheetId = await createSpreadsheetTab(id, 'Transactions'); //create second tab 'Transactions'

    const totalSheetInitData: SheetsRowData[] = [
      {
        values: [buildBoldCell('status'), { userEnteredValue: { stringValue: 'draft' } }],
      },
      { values: [] },
      {
        values: [buildBoldCell('Initial Balance'), { userEnteredValue: { numberValue: 0 } }],
      },
      { values: [] },
      { values: [buildBoldCell('Categories:')] },
    ];

    const transactionsSheetInitData: SheetsRowData[] = [
      {
        values: [
          buildBoldCell('ID'),
          buildBoldCell('Date'),
          buildBoldCell('Type'),
          buildBoldCell('Category'),
          buildBoldCell('Amount'),
          buildBoldCell('Comment'),
        ],
      },
    ];

    await batchUpdateSpreadsheet(id, [
      buildUpdateCellsValueRequest(0, 0, 0, totalSheetInitData), //write init data to 'Total'
      buildUpdateCellsValueRequest(transactionsSheetId, 0, 0, transactionsSheetInitData), //write init data to 'Transactions'
      buildConvertToTableRequest('Transactions', transactionsSheetId),
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

  if (tabs.total == null || tabs.transactions == null)
    throw new Error('[Spreadsheet Service] Failed to receive sheets IDs.');

  return {
    total: tabs.total,
    transactions: tabs.transactions,
  };
};

export const getSpreadsheetStatus = async (id: string): Promise<string | null> => {
  const values = await getSpreadsheetValues<string | null>(id, 'Total!B1:B1');

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
