import { SPREADSHEET_SCHEMA } from '../../schemas/spreadsheet';
import type { SpreadsheetUpdateBordersRequest } from '../../types/requests';
import type { AnnualTabRowIndexes } from '../../types/spreadsheet';
import { buildUpdateBordersRequest } from '../../utils/requestsFactory';

export const buildBordersRequests = (
  sheetId: number,
  indexes: AnnualTabRowIndexes,
): SpreadsheetUpdateBordersRequest[] => {
  const { borders, coords, columns } = SPREADSHEET_SCHEMA.yearTab;

  const headerRange = `${columns.categories}${coords.categories.row}:${columns.average}${coords.categories.row}`;
  const headerBordersRequest = buildUpdateBordersRequest(sheetId, { ...borders.leftPart, range: headerRange });

  const monthsRange = `${columns.january}${coords.categories.row}:${columns.december}${coords.categories.row}`;
  const monthsBordersRequest = buildUpdateBordersRequest(sheetId, { ...borders.months, range: monthsRange });

  const annualRange = `${columns.annual}${coords.categories.row}:${columns.annual}${coords.categories.row}`;
  const annualBordersRequest = buildUpdateBordersRequest(sheetId, { ...borders.annual, range: annualRange });

  const spendingCategoriesRange = `${columns.categories}${coords.categories.row + 1}:${columns.average}${indexes.spendingLast}`;
  const spendingCategoriesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.categories,
    range: spendingCategoriesRange,
  });

  const totalSpendingRange = `${columns.categories}${indexes.spendingLast}:${columns.annual}${indexes.spendingLast + 1}`;
  const totalSpendingBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.total,
    range: totalSpendingRange,
  });

  const incomeCategoriesRange = `${columns.categories}${indexes.incomeFirst}:${columns.average}${indexes.incomeLast}`;
  const incomeCategoriesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.leftPart,
    range: incomeCategoriesRange,
  });

  const totalIncomeRange = `${columns.categories}${indexes.incomeLast}:${columns.annual}${indexes.incomeLast + 1}`;
  const totalIncomeBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.total,
    range: totalIncomeRange,
  });

  const monthsSpendingRange = `${columns.january}${coords.categories.row + 1}:${columns.december}${indexes.spendingLast}`;
  const monthsSpendingValuesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.months,
    range: monthsSpendingRange,
  });

  const monthsIncomeValuesRange = `${columns.january}${indexes.incomeFirst}:${columns.december}${indexes.incomeLast}`;
  const monthsIncomeValuesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.months,
    range: monthsIncomeValuesRange,
  });

  const annualSpendingRange = `${columns.annual}${coords.categories.row + 1}:${columns.annual}${indexes.spendingLast}`;
  const annualSpendingValuesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.annual,
    range: annualSpendingRange,
  });

  const annualIncomeValuesRange = `${columns.annual}${indexes.incomeFirst}:${columns.annual}${indexes.incomeLast}`;
  const annualIncomeValuesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.annual,
    range: annualIncomeValuesRange,
  });

  const differenceCategoriesRange = `${columns.categories}${indexes.differenceFirst}:${columns.average}${indexes.differenceLast}`;
  const differenceCategoriesBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.leftPart,
    range: differenceCategoriesRange,
  });

  const differenceMonthsRange = `${columns.january}${indexes.differenceFirst}:${columns.december}${indexes.differenceLast}`;
  const differenceMonthsBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.months,
    range: differenceMonthsRange,
  });

  const differenceAnnualRange = `${columns.annual}${indexes.differenceFirst}:${columns.annual}${indexes.differenceLast}`;
  const differenceAnnualBordersRequest = buildUpdateBordersRequest(sheetId, {
    ...borders.annual,
    range: differenceAnnualRange,
  });

  return [
    headerBordersRequest,
    monthsBordersRequest,
    annualBordersRequest,
    spendingCategoriesBordersRequest,
    totalSpendingBordersRequest,
    totalIncomeBordersRequest,
    incomeCategoriesBordersRequest,
    monthsSpendingValuesBordersRequest,
    monthsIncomeValuesBordersRequest,
    annualSpendingValuesBordersRequest,
    annualIncomeValuesBordersRequest,
    differenceCategoriesBordersRequest,
    differenceMonthsBordersRequest,
    differenceAnnualBordersRequest,
  ];
};
