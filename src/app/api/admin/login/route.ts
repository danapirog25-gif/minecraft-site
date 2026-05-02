import { NextResponse } from "next/server";
import { z } from "zod";
import {
  clearAdminCookie,
  clearAdminTwoFactorCookie,
  createAdminSession,
  createAdminTwoFactorChallenge,
  createAdminTwoFactorCode,
  getAdminTwoFactorChallenge,
  getAdminTwoFactorEmails,
  isAdminTwoFactorEnabled,
  setAdminCookie,
  setAdminTwoFactorCookie,
  verifyAdminPassword,
  verifyAdminTwoFactorCode
} from "@/lib/admin-auth";
import { sendAdminLoginCodeEmail } from "@/lib/email";

const loginSchema = z.object({
  password: z.string().min(1).optional(),
  code: z.string().trim().regex(/^\d{6}$/).optional()
});

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 8;

const globalForRateLimit = globalThis as typeof globalThis & {
  __zesAdminLoginAttempts?: Map<string, { count: number; resetAt: number }>;
};

const loginAttempts = globalForRateLimit.__zesAdminLoginAttempts ?? new Map<string, { count: number; resetAt: number }>();
globalForRateLimit.__zesAdminLoginAttempts = loginAttempts;

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return forwardedFor || realIp || "unknown";
}

function getRateLimitRetryAfterSeconds(clientKey: string): number {
  const attempt = loginAttempts.get(clientKey);
  if (!attempt) {
    return 0;
  }

  if (attempt.resetAt <= Date.now()) {
    loginAttempts.delete(clientKey);
    return 0;
  }

  return attempt.count >= RATE_LIMIT_MAX_ATTEMPTS ? Math.ceil((attempt.resetAt - Date.now()) / 1000) : 0;
}

function recordFailedAttempt(clientKey: string): void {
  const current = loginAttempts.get(clientKey);

  if (!current || current.resetAt <= Date.now()) {
    loginAttempts.set(clientKey, {
      count: 1,
      resetAt: Date.now() + RATE_LIMIT_WINDOW_MS
    });
    return;
  }

  loginAttempts.set(clientKey, {
    count: current.count + 1,
    resetAt: current.resetAt
  });
}

function clearFailedAttempts(clientKey: string): void {
  loginAttempts.delete(clientKey);
}

function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) {
    return email;
  }

  const visible = localPart.slice(0, Math.min(2, localPart.length));
  return `${visible}${"*".repeat(Math.max(3, localPart.length - visible.length))}@${domain}`;
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);
  const retryAfter = getRateLimitRetryAfterSeconds(clientKey);

  if (retryAfter > 0) {
    return NextResponse.json(
      { error: `Забагато спроб входу. Спробуйте ще раз через ${Math.ceil(retryAfter / 60)} хв.` },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter)
        }
      }
    );
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success || (!parsed.data.password && !parsed.data.code)) {
    recordFailedAttempt(clientKey);
    return NextResponse.json({ error: "Некоректні дані входу" }, { status: 400 });
  }

  if (parsed.data.code) {
    const verification = verifyAdminTwoFactorCode(await getAdminTwoFactorChallenge(), parsed.data.code);

    if (!verification.ok) {
      recordFailedAttempt(clientKey);

      const response = NextResponse.json(
        {
          error:
            verification.reason === "expired"
              ? "Код застарів. Увійдіть паролем ще раз, щоб отримати новий код."
              : verification.reason === "missing"
                ? "Код входу не знайдено. Увійдіть паролем ще раз."
                : `Неправильний код. Спроб залишилось: ${verification.attemptsLeft}.`
        },
        { status: 401 }
      );

      if (verification.nextToken) {
        setAdminTwoFactorCookie(response, verification.nextToken);
      } else {
        clearAdminTwoFactorCookie(response);
      }

      return response;
    }

    clearFailedAttempts(clientKey);
    const response = NextResponse.json({ ok: true });
    setAdminCookie(response, createAdminSession());
    clearAdminTwoFactorCookie(response);
    return response;
  }

  if (!parsed.data.password || !verifyAdminPassword(parsed.data.password)) {
    recordFailedAttempt(clientKey);
    return NextResponse.json({ error: "Неправильний пароль адміністратора" }, { status: 401 });
  }

  try {
    if (isAdminTwoFactorEnabled()) {
      const emails = getAdminTwoFactorEmails();
      const code = createAdminTwoFactorCode();
      const challenge = createAdminTwoFactorChallenge(code);

      await sendAdminLoginCodeEmail({
        emails,
        code
      });

      const response = NextResponse.json({
        ok: true,
        requiresCode: true,
        emailHint: emails.map(maskEmail).join(", ")
      });

      setAdminTwoFactorCookie(response, challenge);
      clearAdminCookie(response);
      return response;
    }
  } catch (error) {
    console.error("admin 2fa send failed", error);
    return NextResponse.json({ error: "Не вдалося надіслати код входу. Перевірте SMTP та ADMIN_2FA_EMAILS." }, { status: 500 });
  }

  clearFailedAttempts(clientKey);
  const response = NextResponse.json({ ok: true });
  setAdminCookie(response, createAdminSession());
  clearAdminTwoFactorCookie(response);
  return response;
}
