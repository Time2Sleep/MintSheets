import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import './style.css';
import App from './App.vue';
import { initGoogle } from './services/googleAuth';
import { router } from './router';
import { vSwipeDown, vSwipeUp } from './directives/swipe';

initGoogle();
const pinia = createPinia();
const app = createApp(App);

pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.use(router);
app.directive('swipe-up', vSwipeUp);
app.directive('swipe-down', vSwipeDown);
app.mount('#app');
