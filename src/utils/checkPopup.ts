export const checkPopupBlocked = (): boolean => {
  const popup = window.open('', '_blank', 'width=100,height=100');

  if (!popup || popup.closed) {
    return true; // Вероятно, заблокировано
  }

  popup.close();
  return false;
};
