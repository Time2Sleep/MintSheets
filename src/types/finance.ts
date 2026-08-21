export type Category = {
  id: number;
  title: string;
  color: string;
};

export type Transaction = {
  id: string;
  sum: number;
  categoryId: number;
  date: string;
  comment?: string;
};

export type TransactionType = 'income' | 'outcome';
