import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useGoogleStore = defineStore('google', () => {
  const googleToken = ref<string | null>(null);

  const isConnected = computed(() => !!googleToken.value);

  const setGoogleToken = (token: string | null) => {
    googleToken.value = token;
  };

  const logoutGoogle = () => {
    googleToken.value = null;
  };

  return {
    googleToken,
    isConnected,
    setGoogleToken,
    logoutGoogle,
  };
});
