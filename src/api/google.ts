import { apiClient } from '.';
import type { UserInfo } from '../types/auth';

export const getUserInfo = async (): Promise<UserInfo> => {
  const response = await apiClient.get<UserInfo>('https://www.googleapis.com/oauth2/v3/userinfo');

  return response.data;
};
