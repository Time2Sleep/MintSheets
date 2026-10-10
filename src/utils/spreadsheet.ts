import type { RawCellValue, SheetsCellData } from '../types/spreadsheet';

export const buildFormula = (cell: RawCellValue): SheetsCellData => {
  const userEnteredFormat: SheetsCellData['userEnteredFormat'] = { numberFormat: { type: 'NUMBER', pattern: '0' } };

  if (typeof cell === 'object') {
    const format = applyCellFormat(cell)?.userEnteredFormat ?? userEnteredFormat;

    return {
      userEnteredValue: { formulaValue: `${cell.value}` },
      userEnteredFormat: format,
    };
  }

  return {
    userEnteredValue: { formulaValue: `${cell}` },
    userEnteredFormat,
  };
};

export const buildCell = (text: string | number): SheetsCellData => {
  const userEnteredValue = typeof text === 'string' ? { stringValue: text } : { numberValue: text };

  return { userEnteredValue };
};

export const buildBoldCell = (text: string | number): SheetsCellData => {
  const userEnteredValue = typeof text === 'string' ? { stringValue: text } : { numberValue: text };

  return { userEnteredValue, userEnteredFormat: { textFormat: { bold: true } } };
};

export const buildOtherSheetRange = (
  sheetName: string,
  columnStart: string,
  rowStart: number,
  columnEnd: string,
  rowEnd?: number,
) => {
  const rowEndIndex = rowEnd ? `$${rowEnd + 1}` : '';
  return `${sheetName}!$${columnStart}$${rowStart + 1}:$${columnEnd}${rowEndIndex}`;
};

export const applyCellFormat = (cell: RawCellValue): SheetsCellData => {
  if (typeof cell !== 'object') return buildCell(cell);

  const value = cell.format?.bold ? buildBoldCell(cell.value) : buildCell(cell.value);
  if (cell.format?.numberFormat) {
    value.userEnteredFormat = {
      numberFormat: {
        type: cell.format.numberFormat,
        pattern: cell.pattern || undefined,
      },
    };
  }

  return value;
};
