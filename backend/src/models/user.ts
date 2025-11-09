export type UserRole = "admin" | "pilot" | "user";

export interface User {
  email: string;
  fullName: string;
  password: string; // Add this field
  role: UserRole;
  accessLevel?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
}

