import { createRouter, createWebHistory } from 'vue-router';
import AuthView from '../components/views/AuthView.vue';
import MainView from '../components/views/MainView.vue';
import AnalyticsView from '../components/views/AnalyticsView.vue';
import HistoryView from '../components/views/HistoryView.vue';
import { useGoogleStore } from '../stores/google';

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
  {
    path: '/history',
    name: 'history',
    component: HistoryView,
    meta: { requiresAuth: true, title: 'Transactions' },
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

  if (isAuthRequired && !isAuthenticated) {
    return { name: 'auth' };
  } else if (to.name === 'auth' && isAuthenticated) {
    return { name: 'main' };
  }

  return;
});
