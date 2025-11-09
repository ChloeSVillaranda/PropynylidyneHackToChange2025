import { apiConfig } from './config';
import { LoginRequest, LoginResponse } from '../types';

export const authService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const loginData: LoginRequest = { username, password };
    const response = await fetch(`${apiConfig.baseURL}/auth/login`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify(loginData),
    });
    if (!response.ok) throw new Error('Login failed');
    const data: LoginResponse = await response.json();
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }
    return data;
  },

  logout: (): void => {
    localStorage.removeItem('authToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};
