import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

import { USERS_TABLE, documentClient } from "../config/dynamoClient.js";
import { User, UserRole } from "../models/user.js";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const listUsers = async (): Promise<User[]> => {
  const command = new ScanCommand({
    TableName: USERS_TABLE
  });

  const result = await documentClient.send(command);

  return (result.Items as User[]) ?? [];
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const command = new GetCommand({
    TableName: USERS_TABLE,
    Key: {
      email: normalizeEmail(email)
    }
  });

  const result = await documentClient.send(command);

  return (result.Item as User) ?? null;
};

export const createUser = async (user: Omit<User, "createdAt">): Promise<User> => {
  const item: User = {
    ...user,
    email: normalizeEmail(user.email),
    role: (user.role ?? "user") as UserRole,
    createdAt: new Date().toISOString()
  };

  const command = new PutCommand({
    TableName: USERS_TABLE,
    Item: item,
    ConditionExpression: "attribute_not_exists(email)"
  });

  await documentClient.send(command);

  return item;
};

export const updateUser = async (
  email: string,
  updates: Partial<Omit<User, "email" | "createdAt">>
): Promise<User | null> => {
  if (Object.keys(updates).length === 0) {
    throw new Error("No fields provided to update");
  }

  const normalizedEmail = normalizeEmail(email);

  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};
  const setExpressions: string[] = [];

  Object.entries(updates).forEach(([key, value]) => {
    const attributeName = `#${key}`;
    const attributeValue = `:${key}`;
    expressionAttributeNames[attributeName] = key;
    expressionAttributeValues[attributeValue] = value;
    setExpressions.push(`${attributeName} = ${attributeValue}`);
  });

  const command = new UpdateCommand({
    TableName: USERS_TABLE,
    Key: {
      email: normalizedEmail
    },
    ConditionExpression: "attribute_exists(email)",
    UpdateExpression: `SET ${setExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: "ALL_NEW"
  });

  const result = await documentClient.send(command);

  return (result.Attributes as User) ?? null;
};

export const deleteUser = async (email: string): Promise<void> => {
  const command = new DeleteCommand({
    TableName: USERS_TABLE,
    Key: {
      email: normalizeEmail(email)
    },
    ConditionExpression: "attribute_exists(email)"
  });

  await documentClient.send(command);
};

