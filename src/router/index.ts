import { createRouter, createWebHistory } from 'vue-router';
import { useGoogleStore } from '../stores/google';
import { storeToRefs } from 'pinia';
import { routes } from './routes';
import { SessionStatus } from '../types/auth';
import { SpreadsheetStatus } from '../types/spreadsheet';

export const router = createRouter({
  history: createWebHistory('/MintSheets/'),
  routes,
});

router.beforeEach((to) => {
  const googleStore = useGoogleStore();
  const isAuthRequired = to.meta.requiresAuth;
  const { sessionStatus } = storeToRefs(googleStore);

  if (
    isAuthRequired &&
    !(sessionStatus.value === SessionStatus.READY || sessionStatus.value === SessionStatus.OFFLINE)
  ) {
    return { name: 'auth' };
  } else if (googleStore.spreadsheetStatus === SpreadsheetStatus.DRAFT && to.name !== 'onboarding') {
    return { name: 'onboarding' };
  } else if (to.meta.draftOnly && googleStore.spreadsheetStatus !== SpreadsheetStatus.DRAFT) {
    return { name: 'main' };
  } else if (to.name === 'auth' && sessionStatus.value === SessionStatus.READY) {
    return { name: 'main' };
  }

  return;
});
