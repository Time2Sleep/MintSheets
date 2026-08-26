export type Transaction = {
  id: string;
  amount: number;
  category: string;
  date: string;
  comment?: string;
};

export type TransactionWithoutId = Omit<Transaction, 'id' | 'amount'> & {
  amount?: number | string;
};
