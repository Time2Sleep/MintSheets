import type { Currency } from '../constants/currencies';

export const TransactionTypes = {
  INCOME: 'income',
  SPENDING: 'spending',
} as const;

export type TransactionType = (typeof TransactionTypes)[keyof typeof TransactionTypes];

export type Transaction = {
  id: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
  comment?: string;
  pending?: boolean;
};

export type TransactionFormData = {
  amount: string;
  type: Transaction['type'];
  category: string;
  date: string;
  comment: string;
};

export interface SpreadsheetSettings {
  balance: number;
  currency: Currency;
  spendingCategories: string[];
  incomeCategories: string[];
}

export interface SpreadsheetSettingsFormData {
  balance: string;
  currency: string;
  incomeCategories: string[];
  spendingCategories: string[];
}
