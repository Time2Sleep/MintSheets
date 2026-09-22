import type { TokenClient, TokenResponse } from '../types/auth';

let tokenClient: TokenClient | null = null;

export const loadGoogleSDK = (): Promise<void> => {
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

export const initializeGoogleAuth = (
  onTokenReceived: (token: string) => void,
  onError: (error: Error) => void,
): void => {
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google SDK is not loaded');
  }

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('VITE_GOOGLE_CLIENT_ID is missing in environment variables');
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.metadata.readonly',
    callback: (response: TokenResponse) => {
      if (response.access_token) {
        onTokenReceived(response.access_token);
      } else {
        onError(new Error('OAuth Error:' + response.error));
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

export const refreshGoogleToken = (): void => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: '' });
  } else {
    console.warn('Token client is not initialized');
  }
};
