export const buildRenameSheetRequest = (sheetId: number, newTitle: string) => ({
  updateSheetProperties: {
    properties: {
      sheetId,
      title: newTitle,
    },
    fields: 'title',
  },
});

export const buildAddSheetRequest = (title: string) => ({
  addSheet: {
    properties: {
      title,
    },
  },
});

export const buildRange = (
  sheetId: number,
  startRow: number,
  endRow: number,
  startColumn: number,
  endColumn: number,
) => ({
  sheetId,
  startRowIndex: startRow,
  endRowIndex: endRow,
  startColumnIndex: startColumn,
  endColumnIndex: endColumn,
});

export const buildBoldtextRequest = (
  sheetId: number,
  startRow: number,
  endRow: number,
  startColumn: number,
  endColumn: number,
) => ({
  repeatCell: {
    range: buildRange(sheetId, startRow, endRow, startColumn, endColumn),
    cell: {
      userEnteredFormat: {
        textFormat: {
          bold: true,
        },
      },
    },
    fields: 'userEnteredFormat.textFormat.bold',
  },
});
