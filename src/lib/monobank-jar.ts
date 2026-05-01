import { getMonoJarSendId } from "@/lib/monobank";
import crypto from "crypto";

const MONOBANK_API_URL = "https://api.monobank.ua";

type MonoJar = {
  id: string;
  sendId?: string;
  title?: string;
};

type MonoClientInfo = {
  jars?: MonoJar[];
};

let cachedJarAccountId: string | null = null;
let cachedJarAccountIdAt = 0;

export type MonoJarStatementItem = {
  id: string;
  time?: number;
  description?: string;
  amount: number;
  operationAmount?: number;
  currencyCode?: number;
  hold?: boolean;
  comment?: string;
};

export type MonoJarWebhookPayload = {
  type?: string;
  data?: {
    account?: string;
    statementItem?: MonoJarStatementItem;
  };
};

export function createJarCommentCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";

  for (let index = 0; index < 8; index += 1) {
    suffix += alphabet[crypto.randomInt(0, alphabet.length)];
  }

  return `ZES-${suffix}`;
}

export function extractJarCommentCode(comment?: string | null): string | null {
  const match = comment?.toUpperCase().match(/\bZES-[A-Z0-9]{8}\b/);
  return match?.[0] ?? null;
}

export function getMonoPersonalWebhookSecret(): string {
  const secret = process.env.MONOBANK_PERSONAL_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error("MONOBANK_PERSONAL_WEBHOOK_SECRET is not configured");
  }

  return secret;
}

export function getMonoPersonalWebhookUrl(): string {
  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  return `${appUrl}/api/monobank/jar-webhook/${encodeURIComponent(getMonoPersonalWebhookSecret())}`;
}

export async function getMonoJarAccountId(): Promise<string | null> {
  const configuredAccountId = process.env.MONOBANK_JAR_ACCOUNT_ID;
  if (configuredAccountId) {
    return configuredAccountId;
  }

  const sendId = getMonoJarSendId();
  const token = process.env.MONOBANK_PERSONAL_TOKEN;

  if (!sendId || !token) {
    return null;
  }

  const now = Date.now();
  if (cachedJarAccountId && now - cachedJarAccountIdAt < 60_000) {
    return cachedJarAccountId;
  }

  const response = await fetch(`${MONOBANK_API_URL}/personal/client-info`, {
    headers: {
      "X-Token": token
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`monobank client-info failed: ${response.status} ${details}`);
  }

  const data = (await response.json()) as MonoClientInfo;
  const jar = data.jars?.find((item) => item.sendId === sendId || item.id === sendId);
  cachedJarAccountId = jar?.id ?? null;
  cachedJarAccountIdAt = now;

  return cachedJarAccountId;
}

export async function isExpectedMonoJarAccount(account?: string): Promise<boolean> {
  if (!account) {
    return false;
  }

  const jarAccountId = await getMonoJarAccountId();

  if (jarAccountId) {
    return account === jarAccountId;
  }

  const sendId = getMonoJarSendId();
  return Boolean(sendId && account === sendId);
}
