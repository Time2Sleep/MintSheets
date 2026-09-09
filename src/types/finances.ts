export const TransactionTypes = {
  INCOME: 'income',
  SPENDING: 'spending',
} as const;

export type Transaction = {
  id: string;
  amount: number;
  type: (typeof TransactionTypes)[keyof typeof TransactionTypes];
  category: string;
  date: string;
  comment?: string;
};

export type TransactionFormData = {
  amount: string;
  type: Transaction['type'];
  category: string;
  date: string;
  comment: string;
};
