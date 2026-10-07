import { batchUpdateSpreadsheet, getSpreadsheetValues } from '../../api/sheets';
import { SPREADSHEET_SCHEMA } from '../../schemas/spreadsheet';
import type { SpreadsheetUpdateCellsValueRequest } from '../../types/requests';
import type { RawCellValue, SpreadsheetContext } from '../../types/spreadsheet';
import { coordsToA1Range } from '../../utils/convert';
import { buildUpdateCellsValueRequest } from '../../utils/requestsFactory';

export const getAnalyticsData = async (context: SpreadsheetContext): Promise<Record<number, number>> => {
  const { title, ranges } = SPREADSHEET_SCHEMA.analytics;
  const yearRows = await getSpreadsheetValues<number>(context.spreadsheetId, `${title}!${ranges.data}`);

  return yearRows.reduce((acc, [year, saved]) => ({ ...acc, [year]: saved }), {});
};

export const buildConfigureAnalyticsTabRequest = (tabId: number): SpreadsheetUpdateCellsValueRequest => {
  const { settingsTab, analytics } = SPREADSHEET_SCHEMA;
  const { coords, initialRows, ranges } = analytics;

  const [header, ...rows] = initialRows;

  const balance = {
    value: `=${settingsTab.key}!${coordsToA1Range(settingsTab.coords.balance)} + SUM(${ranges.years})`,
    format: { formula: true },
  };

  const firstRow = [...header, balance];

  return buildUpdateCellsValueRequest(tabId, coords.dataStart.row, coords.dataStart.column, [firstRow, ...rows]);
};

export const addYearToAnalyticsTab = async (
  context: SpreadsheetContext,
  year: string,
  rowOffset: number,
  numberOfCategories: number,
) => {
  const { sheets, spreadsheetId } = context;
  const { coords } = SPREADSHEET_SCHEMA.analytics;

  const savedCell = calculateYearTotalCellRange(numberOfCategories);
  const yearRow: RawCellValue[] = [year, { value: `=${year}!${savedCell}`, format: { formula: true } }];
  const updateCellsValueRequest = buildUpdateCellsValueRequest(
    sheets.analytics,
    coords.years.row + rowOffset,
    coords.years.column,
    [yearRow],
  );

  await batchUpdateSpreadsheet(spreadsheetId, [updateCellsValueRequest]);
};

const calculateYearTotalCellRange = (numberOfCategories: number): string => {
  const { coords, gaps, columns } = SPREADSHEET_SCHEMA.yearTab;

  const numberOfGaps = 2;

  const totalDifferenceRowIndex = coords.categories.row + numberOfCategories + numberOfGaps * gaps.blocks;

  return `${columns.annual}${totalDifferenceRowIndex}`;
};
