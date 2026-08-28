export {};

declare global {
  interface Window {
    google?: GoogleSDK;
  }
}

export interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
}

export interface TokenResponse {
  access_token?: string;
  error?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

export interface TokenClient {
  requestAccessToken: (options?: { prompt?: 'none' | 'consent' | 'select_account' }) => void;
}

export interface GoogleAccountsOAuth2 {
  initTokenClient: (config: TokenClientConfig) => TokenClient;
}

export interface GoogleAccounts {
  oauth2: GoogleAccountsOAuth2;
}

export interface GoogleSDK {
  accounts: GoogleAccounts;
}
