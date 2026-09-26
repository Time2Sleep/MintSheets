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
      read: 'A1:C',
      status: 'B1:B1',
    },
    coords: {
      status: { row: 0, column: 1 },
      balance: { row: 2, column: 1 },
      spendingCategories: { row: 5, column: 0 },
      incomeCategories: { row: 5, column: 1 },
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
    ranges: {
      transactions: 'A2:F',
    },
  },

  yearTab: {
    initialRows: [
      [],
      [
        { value: 'Spending', format: { bold: true } },
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
      categories: { row: 3, column: 0 },
    },
    ranges: {
      january: 'C',
      december: 'N',
      sum: '$E$2:$E',
      month: '$B$2:$B',
      year: '$B$2:$B',
      category: '$D$2:$D',
      type: '$C$2:$C',
    },
  },
} as const;
