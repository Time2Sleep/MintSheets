import AuthView from '../components/views/AuthView.vue';
import MainView from '../components/views/MainView.vue';
import AnalyticsView from '../components/views/AnalyticsView.vue';
import SettingsView from '../components/views/settings/SettingsView.vue';
import OnboardingView from '../components/views/OnboardingView.vue';
import BalanceAndCurrency from '../components/views/settings/BalanceAndCurrency.vue';
import CategoriesSettings from '../components/views/settings/CategoriesSettings.vue';

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
    meta: { requiresAuth: true, title: 'Settings' },
    children: [
      {
        path: '',
        name: 'settings',
        component: SettingsView,
      },
      {
        path: 'balance',
        name: 'settings-balance',
        component: BalanceAndCurrency,
      },
      {
        path: 'categories',
        name: 'categories',
        component: CategoriesSettings,
      },
    ],
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: OnboardingView,
    meta: { requiresAuth: true, title: 'Onboarding', draftOnly: true },
  },
];
