import { createRouter, createWebHistory } from 'vue-router';
import { useGoogleStore } from '../stores/google';
import { storeToRefs } from 'pinia';
import { routes } from './routes';

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const googleStore = useGoogleStore();
  const isAuthRequired = to.meta.requiresAuth;
  const isAuthenticated = !!googleStore.googleToken;
  const { isOffline, mintsWasConnected } = storeToRefs(googleStore);

  if (isAuthRequired && !isAuthenticated && (!isOffline.value || !mintsWasConnected.value)) {
    return { name: 'auth' };
  } else if (to.name === 'auth' && isAuthenticated) {
    return { name: 'main' };
  }

  return;
});
