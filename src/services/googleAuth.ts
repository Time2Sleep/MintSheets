import type { TokenClient, TokenResponse } from '../types/google';
import { useGoogleStore } from '../stores/google';

let tokenClient: TokenClient | null = null;

export const initGoogle = () => {
  loadGoogleSDK()
    .then(() => {
      initGoogleAuth((token) => {
        const googleStore = useGoogleStore();
        googleStore.setGoogleToken(token);
        googleStore.isAuthError = false;
      });
    })
    .catch((err) => {
      console.warn('Google SDK failed to load. Working in offline mode.', err);
      useGoogleStore().isAuthError = true;
    });
};

const loadGoogleSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      return resolve();
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);

    document.head.appendChild(script);
  });
};

const initGoogleAuth = (onTokenReceived: (token: string) => void): void => {
  if (!window.google?.accounts?.oauth2) {
    console.warn('Google SDK is not loaded yet');
    return;
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    console.warn('VITE_GOOGLE_CLIENT_ID is missing in environment variables');
    return;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    callback: (response: TokenResponse) => {
      if (response.error) {
        console.warn('OAuth Error:', response.error);
        return;
      }

      if (response.access_token) {
        onTokenReceived(response.access_token);
      }
    },
  });
};

export const loginWithGoogle = (): void => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } else {
    console.warn('Token client is not initialized');
  }
};
