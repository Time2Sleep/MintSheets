export const getDateFormatted = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getTodayDateFormatted = (): string => {
  return getDateFormatted(new Date());
};

export const isCurrentMonth = (dateString: string): boolean => {
  const date = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
};

export const isToday = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const dateToHumanReadable = (dateString: string): string => {
  const date = new Date(`${dateString}T00:00:00`);
  const today = new Date();
  let year = '';

  if (isToday(dateString)) return 'Today';
  if (date.getFullYear() !== today.getFullYear()) year = date.getFullYear().toString();

  return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'long' })} ${year}`;
};

export const stringDateToSheetDate = (dateString: string): number => {
  const date = new Date(dateString);
  const msPerDay = 24 * 60 * 60 * 1000;
  const excelBaseDate = new Date('1899-12-30'); // Google sheets reference date

  return (date.getTime() - excelBaseDate.getTime()) / msPerDay;
};

export const sheetDateToStringDate = (sheetDate: string | number): string => {
  if (typeof sheetDate === 'string') return sheetDate;

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysBetween = sheetDate - 25569;

  const date = new Date(daysBetween * msPerDay);
  const timezoneOffset = date.getTimezoneOffset() * 60 * 1000;
  const dateNormalized = new Date(date.getTime() + timezoneOffset);

  return getDateFormatted(dateNormalized);
};
