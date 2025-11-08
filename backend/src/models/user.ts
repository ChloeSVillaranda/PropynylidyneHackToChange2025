export type UserRole = "user" | "admin";

export type User = {
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string;
  accessLevel?: string[];
  metadata?: Record<string, string | number | boolean | null>;
};

