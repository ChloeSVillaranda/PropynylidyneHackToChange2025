const TOKEN_KEY = 'authToken';

export const authService = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),
  
  getAuthHeader: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};
