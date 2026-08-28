import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import './style.css';
import App from './App.vue';
import { initGoogleAuth, loadGoogleSDK } from './services/googleAuth';
import { useGoogleStore } from './stores/google';

loadGoogleSDK()
  .then(() => {
    initGoogleAuth((token) => {
      const googleStore = useGoogleStore();
      googleStore.setGoogleToken(token);
    });
  })
  .catch((err) => {
    console.warn('Google SDK failed to load. Working in offline mode.', err);
  });

const pinia = createPinia();
const app = createApp(App);

pinia.use(piniaPluginPersistedstate);
app.use(pinia);
app.mount('#app');
