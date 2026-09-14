import AuthView from '../components/views/AuthView.vue';
import MainView from '../components/views/MainView.vue';
import AnalyticsView from '../components/views/AnalyticsView.vue';
import SettingsView from '../components/views/SettingsView.vue';

export const routes = [
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
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true, title: 'Settings' },
  },
];
