export const SPREADSHEET_SCHEMA = {
  title: import.meta.env.VITE_SPREADSHEET_TITLE || 'MintSheets_financial_spreadsheet_MVP',
  locale: 'en_US',

  settingsTab: {
    title: 'Settings',
    key: 'settings',
    initialRows: [
      [{ value: 'Status', format: { bold: true } }, 'draft'],
      [],
      [{ value: 'Initial balance', format: { bold: true } }, 0],
      [],
      [{ value: 'Categories:', format: { bold: true } }],
    ],
    ranges: {
      read: 'A1:D',
      status: 'B1:B1',
    },
    coords: {
      status: { row: 0, column: 1 },
      balance: { row: 2, column: 1 },
      spendingCategories: { row: 5, column: 0 },
      incomeCategories: { row: 5, column: 2 },
      currency: { row: 2, column: 2 },
    },
  },

  transactionsTab: {
    title: 'Transactions',
    key: 'transactions',
    initialRows: [
      [
        { value: 'ID:', format: { bold: true } },
        { value: 'Date:', format: { bold: true } },
        { value: 'Type:', format: { bold: true } },
        { value: 'Category:', format: { bold: true } },
        { value: 'Amount:', format: { bold: true } },
        { value: 'Comment:', format: { bold: true } },
      ],
    ],
    columns: {
      ID: 'A',
      Date: 'B',
      Type: 'C',
      Category: 'D',
      Amount: 'E',
      Comment: 'F',
    },
    coords: {
      transactions: { row: 1, column: 0 },
    },
    ranges: {
      transactions: 'A2:F',
    },
  },

  yearTab: {
    initialRows: [
      [],
      [
        { value: 'Spending', format: { bold: true } },
        { value: 'Plan', format: { bold: true } },
        { value: 'Average', format: { bold: true } },
        { value: 'January', format: { bold: true } },
        { value: 'February', format: { bold: true } },
        { value: 'March', format: { bold: true } },
        { value: 'April', format: { bold: true } },
        { value: 'May', format: { bold: true } },
        { value: 'June', format: { bold: true } },
        { value: 'July', format: { bold: true } },
        { value: 'August', format: { bold: true } },
        { value: 'September', format: { bold: true } },
        { value: 'October', format: { bold: true } },
        { value: 'November', format: { bold: true } },
        { value: 'December', format: { bold: true } },
        { value: 'Annual', format: { bold: true } },
      ],
    ],
    coords: {
      categories: { row: 2, column: 0 },
    },
    titles: {
      income: { value: 'Income', format: { bold: true } },
    },
    gaps: {
      blocks: 3,
    },
    columns: {
      categories: 'A',
      plan: 'B',
      average: 'C',
      january: 'D',
      december: 'O',
      annual: 'P',
      count: 15, // 1 average + 1 plan + 12 months + 1 annual
    },
    borders: {
      leftPart: {
        top: 'SOLID',
        left: 'SOLID',
        bottom: 'SOLID',
        right: 'DOUBLE',
      },
      months: {
        top: 'SOLID',
        bottom: 'SOLID',
      },
      annual: {
        top: 'SOLID',
        bottom: 'SOLID',
        right: 'SOLID',
        left: 'DOUBLE',
      },
      categories: {
        right: 'DOUBLE',
        left: 'SOLID',
        bottom: 'SOLID',
      },
      total: {
        top: 'SOLID',
      },
    },
  },
} as const;
