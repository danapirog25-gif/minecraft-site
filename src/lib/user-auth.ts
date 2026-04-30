import crypto from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "zes_user";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const scryptAsync = promisify(crypto.scrypt);

type CurrentUser = {
  id: string;
  email: string;
  minecraftNickname: string;
  contact: string | null;
  balance: number;
  role: string;
};

function getSecret(): string {
  return (
    process.env.USER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    process.env.ADMIN_PASSWORD ||
    "dev-user-secret"
  );
}

function digest(value: string): Buffer {
  return crypto.createHash("sha256").update(value).digest();
}

function hmac(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("base64url");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `scrypt:${salt}:${derived.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [scheme, salt, hash] = storedHash.split(":");

  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, "base64url");
  const received = (await scryptAsync(password, salt, expected.length)) as Buffer;
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export function createUserSession(userId: string): string {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `user.${userId}.${expiresAt}`;
  return `${payload}.${hmac(payload)}`;
}

export function verifyUserSession(value?: string): { userId: string } | null {
  if (!value) {
    return null;
  }

  const parts = value.split(".");
  if (parts.length !== 4 || parts[0] !== "user") {
    return null;
  }

  const payload = `${parts[0]}.${parts[1]}.${parts[2]}`;
  const signature = parts[3];
  const expected = hmac(payload);

  if (!crypto.timingSafeEqual(digest(signature), digest(expected))) {
    return null;
  }

  const expiresAt = Number(parts[2]);
  if (!Number.isFinite(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return { userId: parts[1] };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  const session = verifyUserSession(cookieStore.get(COOKIE_NAME)?.value);

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      minecraftNickname: true,
      contact: true,
      balance: true,
      role: true
    }
  });
}

export function setUserCookie(response: NextResponse, userId: string): void {
  response.cookies.set(COOKIE_NAME, createUserSession(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS,
    path: "/"
  });
}

export function clearUserCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}
