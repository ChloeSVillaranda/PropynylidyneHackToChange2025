import { Request, Response } from "express";

import {
  createUser,
  deleteUser,
  getUserByEmail,
  listUsers,
  updateUser
} from "../services/usersService.js";
import { UserRole } from "../models/user.js";

const allowedRoles: UserRole[] = ["user", "admin"];

const normalizeRole = (role?: unknown): UserRole | undefined => {
  if (!role) {
    return undefined;
  }

  const candidate = String(role).toLowerCase() as UserRole;
  return allowedRoles.includes(candidate) ? candidate : undefined;
};

export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await listUsers();
    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  const { email } = req.params;
  const user = await getUserByEmail(email);

  if (!user) {
    res.status(404).json({ message: `User ${email} not found` });
    return;
  }

  res.json({ data: user });
};

export const createUserHandler = async (req: Request, res: Response) => {
  const payload = req.body;

  if (!payload?.email) {
    res.status(400).json({ message: "email is required" });
    return;
  }

  if (!payload?.fullName) {
    res.status(400).json({ message: "fullName is required" });
    return;
  }

  const role = normalizeRole(payload.role) ?? "user";

  try {
    const user = await createUser({
      email: payload.email,
      fullName: payload.fullName,
      role,
      lastLoginAt: payload.lastLoginAt,
      accessLevel: payload.accessLevel,
      metadata: payload.metadata
    });

    res.status(201).json({ data: user });
  } catch (error) {
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(409).json({ message: `User ${payload.email} already exists` });
      return;
    }

    res.status(500).json({ message: "Failed to create user" });
  }
};

export const updateUserHandler = async (req: Request, res: Response) => {
  const { email } = req.params;
  const updates = { ...req.body };

  delete updates.email;
  delete updates.createdAt;

  if (updates.role) {
    const normalizedRole = normalizeRole(updates.role);
    if (!normalizedRole) {
      res.status(400).json({ message: "role must be either user or admin" });
      return;
    }
    updates.role = normalizedRole;
  }

  try {
    const updated = await updateUser(email, updates);
    if (!updated) {
      res.status(404).json({ message: `User ${email} not found` });
      return;
    }

    res.json({ data: updated });
  } catch (error) {
    if ((error as Error).message === "No fields provided to update") {
      res.status(400).json({ message: "Provide at least one field to update" });
      return;
    }
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(404).json({ message: `User ${email} not found` });
      return;
    }
    res.status(500).json({ message: "Failed to update user" });
  }
};

export const removeUser = async (req: Request, res: Response) => {
  const { email } = req.params;

  try {
    await deleteUser(email);
    res.status(204).send();
  } catch (error) {
    if ((error as Error).name === "ConditionalCheckFailedException") {
      res.status(404).json({ message: `User ${email} not found` });
      return;
    }
    res.status(500).json({ message: "Failed to delete user" });
  }
};

