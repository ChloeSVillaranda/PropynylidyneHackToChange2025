const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    ...apiConfig.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};
