import { createRouter, createWebHistory } from 'vue-router';
import { useGoogleStore } from '../stores/google';
import { storeToRefs } from 'pinia';
import { routes } from './routes';
import { SessionStatus } from '../types/auth';

export const router = createRouter({
  history: createWebHistory(),
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
  } else if (to.name === 'auth' && sessionStatus.value === SessionStatus.READY) {
    return { name: 'main' };
  }

  return;
});
