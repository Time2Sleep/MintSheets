import { CURRENCIES, type Currency } from '../constants/currencies';

export const getCurrencyByCode = (code: string): Currency | undefined => {
  return CURRENCIES.find((currency) => currency.code === code);
};
