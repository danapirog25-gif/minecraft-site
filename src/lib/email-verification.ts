import crypto from "crypto";

export const EMAIL_VERIFICATION_TTL_MINUTES = 15;
export const EMAIL_VERIFICATION_MAX_ATTEMPTS = 5;

function getVerificationSecret(): string {
  return (
    process.env.EMAIL_VERIFICATION_SECRET ||
    process.env.USER_SESSION_SECRET ||
    process.env.ADMIN_SESSION_SECRET ||
    "dev-email-verification-secret"
  );
}

export function createEmailVerificationCode(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function getEmailVerificationExpiresAt(now = new Date()): Date {
  return new Date(now.getTime() + EMAIL_VERIFICATION_TTL_MINUTES * 60 * 1000);
}

export function hashEmailVerificationCode(email: string, code: string): string {
  return crypto.createHmac("sha256", getVerificationSecret()).update(`${email}:${code}`).digest("hex");
}

export function isEmailVerificationCodeValid(email: string, code: string, expectedHash: string): boolean {
  const receivedHash = hashEmailVerificationCode(email, code);
  const received = Buffer.from(receivedHash, "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}
