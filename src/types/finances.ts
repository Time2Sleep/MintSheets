export const TransactionTypes = {
  INCOME: 'income',
  SPENDING: 'spending',
} as const;

export type Transaction = {
  id: string;
  amount: number;
  type: typeof TransactionTypes.INCOME | typeof TransactionTypes.SPENDING;
  category: string;
  date: string;
  comment?: string;
};

export type TransactionWithoutId = Omit<Transaction, 'id' | 'amount'> & {
  amount?: number | string;
};
