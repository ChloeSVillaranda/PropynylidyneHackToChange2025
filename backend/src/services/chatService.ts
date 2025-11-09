import { randomUUID } from "crypto";

import {
  PutCommand,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";

import { CHAT_TABLE, documentClient } from "../config/dynamoClient.js";

export type ChatMessage = {
  roomId: string;
  createdAt: string;
  messageId: string;
  author?: string | null;
  text: string;
};

export type CreateChatMessageInput = {
  roomId?: string;
  author?: string | null;
  text: string;
};

const sanitizeAuthor = (author: unknown): string | undefined => {
  if (typeof author !== "string") {
    return undefined;
  }
  const trimmed = author.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 64) : undefined;
};

const sanitizeText = (text: unknown): string => {
  if (typeof text !== "string") {
    throw new Error("Message text must be a string");
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new Error("Message text is required");
  }
  if (trimmed.length > 1000) {
    return trimmed.slice(0, 1000);
  }
  return trimmed;
};

export const createMessage = async (input: CreateChatMessageInput): Promise<ChatMessage> => {
  const nowIso = new Date().toISOString();
  const message: ChatMessage = {
    roomId: input.roomId?.trim() || "global",
    createdAt: nowIso,
    messageId: randomUUID(),
    author: sanitizeAuthor(input.author) ?? null,
    text: sanitizeText(input.text)
  };

  const command = new PutCommand({
    TableName: CHAT_TABLE,
    Item: message
  });

  await documentClient.send(command);
  return message;
};

export const listMessages = async (
  roomId: string,
  options: { limit?: number; since?: string } = {}
): Promise<ChatMessage[]> => {
  const { limit = 50, since } = options;

  const expressionValues: Record<string, unknown> = {
    ":roomId": roomId
  };

  let keyConditionExpression = "roomId = :roomId";

  if (since) {
    expressionValues[":since"] = since;
    keyConditionExpression += " AND createdAt >= :since";
  }

  const command = new QueryCommand({
    TableName: CHAT_TABLE,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionValues,
    ScanIndexForward: true,
    Limit: limit
  });

  const result = await documentClient.send(command);

  return (result.Items as ChatMessage[]) ?? [];
};


