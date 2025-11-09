import { apiConfig } from './config';
import { LoginRequest, LoginResponse } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const loginData: LoginRequest = { email, password };
    const response = await fetch(`${apiConfig.baseURL}/auth/login`, {
      method: 'POST',
      headers: apiConfig.headers,
      body: JSON.stringify(loginData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Login failed');
    }

    const data: LoginResponse = await response.json();

    if (data?.token) {
      localStorage.setItem('authToken', data.token);
    }
    if (data?.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};
