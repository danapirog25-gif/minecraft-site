import { getMonoJarSendId } from "@/lib/monobank";
import crypto from "crypto";

const MONOBANK_API_URL = "https://api.monobank.ua";

type MonoJar = {
  id: string;
  sendId?: string;
  title?: string;
};

type MonoClientInfo = {
  webHookUrl?: string;
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

function getMonoPersonalToken(): string {
  const token = process.env.MONOBANK_PERSONAL_TOKEN;

  if (!token) {
    throw new Error("MONOBANK_PERSONAL_TOKEN is not configured");
  }

  return token;
}

export async function fetchMonoClientInfo(): Promise<MonoClientInfo> {
  const response = await fetch(`${MONOBANK_API_URL}/personal/client-info`, {
    headers: {
      "X-Token": getMonoPersonalToken()
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`monobank client-info failed: ${response.status} ${details}`);
  }

  return (await response.json()) as MonoClientInfo;
}

export async function registerMonoPersonalWebhook(): Promise<{ webHookUrl: string }> {
  const webHookUrl = getMonoPersonalWebhookUrl();
  const response = await fetch(`${MONOBANK_API_URL}/personal/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Token": getMonoPersonalToken()
    },
    body: JSON.stringify({ webHookUrl }),
    cache: "no-store"
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`monobank personal webhook registration failed: ${response.status} ${details}`);
  }

  return { webHookUrl };
}

export async function getMonoJarAccountId(): Promise<string | null> {
  const configuredAccountId = process.env.MONOBANK_JAR_ACCOUNT_ID;
  if (configuredAccountId) {
    return configuredAccountId;
  }

  const sendId = getMonoJarSendId();
  if (!sendId || !process.env.MONOBANK_PERSONAL_TOKEN) {
    return null;
  }

  const now = Date.now();
  if (cachedJarAccountId && now - cachedJarAccountIdAt < 60_000) {
    return cachedJarAccountId;
  }

  const data = await fetchMonoClientInfo();
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

export async function fetchMonoJarStatement(from: number, to: number): Promise<MonoJarStatementItem[]> {
  const accountId = await getMonoJarAccountId();
  if (!accountId) {
    throw new Error("MONOBANK_JAR_ACCOUNT_ID could not be resolved");
  }

  const response = await fetch(
    `${MONOBANK_API_URL}/personal/statement/${encodeURIComponent(accountId)}/${from}/${to}`,
    {
      headers: {
        "X-Token": getMonoPersonalToken()
      },
      cache: "no-store"
    }
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`monobank jar statement failed: ${response.status} ${details}`);
  }

  return (await response.json()) as MonoJarStatementItem[];
}
