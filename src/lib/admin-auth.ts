import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "zes_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-admin-secret";
}

function getAdminPassword(): string {
  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_PASSWORD) {
    throw new Error("ADMIN_PASSWORD is required in production");
  }

  return process.env.ADMIN_PASSWORD || "admin123";
}

function digest(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

function hmac(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function verifyAdminPassword(password: string): boolean {
  const expected = digest(getAdminPassword());
  const received = digest(password);
  return crypto.timingSafeEqual(expected, received);
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

export function clearAdminCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
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
