import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import './style.css';
import App from './App.vue';
import { router } from './router';
import { vSwipeDown, vSwipeUp } from './directives/swipe';
import { initializeAuth } from './services/application.ts';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.use(pinia);
app.use(router);
app.directive('swipe-up', vSwipeUp);
app.directive('swipe-down', vSwipeDown);
app.mount('#app');

initializeAuth();
