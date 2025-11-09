export interface LoginRequest {
  email: string;
  password: string;
}

export type UserRole = 'admin' | 'user';

export interface LoginUser {
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  role: UserRole;
  expiresIn?: string | number;
  user: LoginUser;
  message?: string;
}
