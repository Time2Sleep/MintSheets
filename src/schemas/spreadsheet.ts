export const SPREADSHEET_SCHEMA = {
  title: 'MintSheets_financial_spreadsheet_MVP',

  settingsTab: {
    title: 'Settings',
    key: 'settings',
    initialRows: [
      [{ value: 'Status', format: { bold: true } }, 'active'],
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
} as const;
