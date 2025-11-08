export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export type UserRole = 'admin' | 'operator' | 'viewer';
