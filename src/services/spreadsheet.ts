import { createSpreadsheet, batchUpdateSpreadsheet, getSheetsProperties, getSpreadsheetValues } from '../api/sheets';
import type { SheetsRowData } from '../types/api';
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
        values: [buildBoldCell('status'), { userEnteredValue: { stringValue: 'active' } }],
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
      buildUpdateCellsValueRequest(0, 0, totalSheetInitData), //write init data to 'Total'
      buildUpdateCellsValueRequest(transactionsSheetId, 0, transactionsSheetInitData), //write init data to 'Transactions'
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

export const getSpreadsheetTabsIDs = async (id: string): Promise<Record<string, number>> => {
  const properties = await getSheetsProperties(id);

  return properties.sheets.reduce(
    (acc, { properties }) => {
      acc[properties.title.toLowerCase()] = properties.sheetId;

      return acc;
    },
    {} as Record<string, number>,
  );
};

export const isSpreadsheetActive = async (id: string): Promise<boolean> => {
  const values = await getSpreadsheetValues(id, 'Total!B1:B1');
  return values[0]?.[0] === 'active';
};
