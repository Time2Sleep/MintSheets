export const getTodayDateFormatted = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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
