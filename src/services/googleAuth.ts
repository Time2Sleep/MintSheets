import type { TokenClient, TokenResponse } from '../types/google';
import { useGoogleStore } from '../stores/google';
import { router } from '../router';

let tokenClient: TokenClient | null = null;

export const initGoogle = () => {
  loadGoogleSDK()
    .then(() => {
      const googleStore = useGoogleStore();

      authenticateWithGoogle(async (token) => {
        googleStore.setGoogleToken(token);
        googleStore.isAuthError = false;

        try {
          console.log('[Auth Service] initializing cloud spreadsheet...');
          await googleStore.findOrCreateSpreadsheet();
          console.log('[Auth Service] Cloud spreadsheet successfully linked to session!');

          router.push({ name: 'main' });
        } catch (error) {
          console.warn('[Auth Service] Critical error while preparing spreadsheet:', error);
          googleStore.isAuthError = true;
        }
      });
    })
    .catch((err) => {
      console.warn(err);
      useGoogleStore().turnOfflineModeOn();
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

    const timeout = setTimeout(() => {
      script.onerror = null; // Clear handlers to prevent memory leaks
      script.onload = null;
      script.remove(); // Remove the stalled script tag from the DOM
      reject(new Error('Google SDK failed to load. Working in offline mode'));
    }, 1000);

    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };

    script.onerror = (error) => {
      clearTimeout(timeout);
      reject(error);
    };

    document.head.appendChild(script);
  });
};

const authenticateWithGoogle = (onTokenReceived: (token: string) => void): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      const err = new Error('Google SDK is not loaded');
      console.warn(err.message);
      reject(err);
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      const err = new Error('VITE_GOOGLE_CLIENT_ID is missing in environment variables');
      console.warn(err.message);
      reject(err);
      return;
    }

    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly',
        callback: (response: TokenResponse) => {
          if (response.error) {
            console.warn('OAuth Error:', response.error);
            useGoogleStore().isAuthError = true;
            return;
          }

          if (response.access_token) {
            onTokenReceived(response.access_token);
          } else {
            console.warn('No access token in response');
            useGoogleStore().isAuthError = true;
          }
        },
      });
      resolve();
    } catch (error) {
      console.warn('Failed to initialize token client:', error);
      reject(error);
    }
  });
};

export const loginWithGoogle = (): void => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } else {
    console.warn('Token client is not initialized');
  }
};

export const refreshGoogleToken = (): void => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: '' });
  } else {
    console.warn('Token client is not initialized');
  }
};
