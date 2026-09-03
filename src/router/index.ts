import { createRouter, createWebHistory } from 'vue-router';
import AuthView from '../components/views/AuthView.vue';
import MainView from '../components/views/MainView.vue';
import AnalyticsView from '../components/views/AnalyticsView.vue';
import { useGoogleStore } from '../stores/google';
import { storeToRefs } from 'pinia';

const routes = [
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
  },
  {
    path: '/',
    name: 'main',
    component: MainView,
    meta: { requiresAuth: true },
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: AnalyticsView,
    meta: { requiresAuth: true, title: 'Analytics' },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const googleStore = useGoogleStore();
  const isAuthRequired = to.meta.requiresAuth;
  const isAuthenticated = !!googleStore.googleToken;
  const { isOffline } = storeToRefs(googleStore);

  if (isAuthRequired && !isAuthenticated && !isOffline.value) {
    return { name: 'auth' };
  } else if (to.name === 'auth' && isAuthenticated) {
    return { name: 'main' };
  }

  return;
});
