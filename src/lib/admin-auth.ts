import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "zes_admin";
const CHALLENGE_COOKIE_NAME = "zes_admin_2fa";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const TWO_FACTOR_TTL_SECONDS = 10 * 60;
const TWO_FACTOR_MAX_ATTEMPTS = 5;

type AdminTwoFactorChallenge = {
  type: "admin-2fa";
  codeHash: string;
  expiresAt: number;
  attemptsLeft: number;
  nonce: string;
};

type AdminTwoFactorVerification =
  | { ok: true }
  | {
      ok: false;
      reason: "missing" | "expired" | "invalid";
      attemptsLeft: number;
      nextToken?: string;
    };

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-admin-secret";
}

function splitEnvList(value?: string): string[] {
  return (value ?? "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAdminPasswords(): string[] {
  const passwords = [...splitEnvList(process.env.ADMIN_PASSWORDS), ...splitEnvList(process.env.ADMIN_PASSWORD)];

  if (process.env.NODE_ENV === "production" && passwords.length === 0) {
    throw new Error("ADMIN_PASSWORD or ADMIN_PASSWORDS is required in production");
  }

  return passwords.length ? Array.from(new Set(passwords)) : ["admin123"];
}

function digest(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

function hmac(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function encodeJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeJson<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function timingSafeEqualString(a: string, b: string): boolean {
  return crypto.timingSafeEqual(digest(a), digest(b));
}

function hashAdminTwoFactorCode(code: string, nonce: string): string {
  return crypto.createHmac("sha256", getSecret()).update(`admin-2fa:${nonce}:${code}`).digest("hex");
}

function createSignedToken(payload: unknown): string {
  const encoded = encodeJson(payload);
  return `${encoded}.${hmac(encoded)}`;
}

function readSignedToken<T>(token?: string): T | null {
  if (!token) {
    return null;
  }

  const [encoded, signature, ...extra] = token.split(".");
  if (!encoded || !signature || extra.length) {
    return null;
  }

  if (!timingSafeEqualString(signature, hmac(encoded))) {
    return null;
  }

  return decodeJson<T>(encoded);
}

export function verifyAdminPassword(password: string): boolean {
  const received = digest(password);

  return getAdminPasswords().some((expectedPassword) => {
    const expected = digest(expectedPassword);
    return crypto.timingSafeEqual(expected, received);
  });
}

export function getAdminTwoFactorEmails(): string[] {
  const configuredEmails = [
    ...splitEnvList(process.env.ADMIN_2FA_EMAILS),
    ...splitEnvList(process.env.ADMIN_2FA_EMAIL),
    ...splitEnvList(process.env.ADMIN_EMAIL),
    ...(process.env.SMTP_HOST ? splitEnvList(process.env.SMTP_USER) : [])
  ];

  if (configuredEmails.length) {
    return Array.from(new Set(configuredEmails));
  }

  if (process.env.ADMIN_2FA_REQUIRED === "true" && process.env.SMTP_USER) {
    return [process.env.SMTP_USER];
  }

  if (process.env.ADMIN_2FA_REQUIRED === "true") {
    throw new Error("ADMIN_2FA_EMAILS is required when ADMIN_2FA_REQUIRED is true");
  }

  return [];
}

export function isAdminTwoFactorEnabled(): boolean {
  return process.env.ADMIN_2FA_REQUIRED === "true" || getAdminTwoFactorEmails().length > 0;
}

export function createAdminTwoFactorCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function createAdminTwoFactorChallenge(code: string): string {
  const nonce = crypto.randomBytes(16).toString("base64url");
  const challenge: AdminTwoFactorChallenge = {
    type: "admin-2fa",
    codeHash: hashAdminTwoFactorCode(code, nonce),
    expiresAt: Math.floor(Date.now() / 1000) + TWO_FACTOR_TTL_SECONDS,
    attemptsLeft: TWO_FACTOR_MAX_ATTEMPTS,
    nonce
  };

  return createSignedToken(challenge);
}

export function verifyAdminTwoFactorCode(token: string | undefined, code: string): AdminTwoFactorVerification {
  const challenge = readSignedToken<AdminTwoFactorChallenge>(token);

  if (!challenge || challenge.type !== "admin-2fa") {
    return { ok: false, reason: "missing", attemptsLeft: 0 };
  }

  if (challenge.expiresAt <= Math.floor(Date.now() / 1000)) {
    return { ok: false, reason: "expired", attemptsLeft: 0 };
  }

  const expectedHash = hashAdminTwoFactorCode(code, challenge.nonce);
  if (timingSafeEqualString(expectedHash, challenge.codeHash)) {
    return { ok: true };
  }

  const attemptsLeft = Math.max(0, challenge.attemptsLeft - 1);
  return {
    ok: false,
    reason: "invalid",
    attemptsLeft,
    nextToken:
      attemptsLeft > 0
        ? createSignedToken({
            ...challenge,
            attemptsLeft
          })
        : undefined
  };
}

export async function getAdminTwoFactorChallenge(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CHALLENGE_COOKIE_NAME)?.value;
}

export function createAdminSession(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `admin.${expiresAt}`;
  return `${payload}.${hmac(payload)}`;
}

export function verifyAdminSession(value?: string): boolean {
  if (!value) {
    return false;
  }

  const parts = value.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const payload = `${parts[0]}.${parts[1]}`;
  const signature = parts[2];
  const expected = hmac(payload);

  if (!crypto.timingSafeEqual(digest(signature), digest(expected))) {
    return false;
  }

  const expiresAt = Number(parts[1]);
  return Number.isFinite(expiresAt) && expiresAt > Math.floor(Date.now() / 1000);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(COOKIE_NAME)?.value);
}

export function setAdminCookie(response: NextResponse, value: string): void {
  response.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/"
  });
}

export function setAdminTwoFactorCookie(response: NextResponse, value: string): void {
  response.cookies.set(CHALLENGE_COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TWO_FACTOR_TTL_SECONDS,
    path: "/"
  });
}

export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export function clearAdminTwoFactorCookie(response: NextResponse): void {
  response.cookies.set(CHALLENGE_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export async function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
