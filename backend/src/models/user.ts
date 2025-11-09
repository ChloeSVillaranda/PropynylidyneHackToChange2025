export type UserRole = "admin" | "user";

export interface User {
  email: string;
  fullName: string;
  password: string;
  role: UserRole;
  lastLoginAt?: string;
  accessLevel?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

