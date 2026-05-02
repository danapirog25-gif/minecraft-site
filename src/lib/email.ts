import nodemailer from "nodemailer";
import { EMAIL_VERIFICATION_TTL_MINUTES } from "@/lib/email-verification";

type RegistrationVerificationEmail = {
  email: string;
  code: string;
};

type AdminLoginCodeEmail = {
  emails: string[];
  code: string;
};

type EmailDeliveryResult = {
  sent: boolean;
  devCode?: string;
};

function getSmtpPort(): number {
  const parsed = Number(process.env.SMTP_PORT);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 587;
}

function getSmtpSecure(): boolean {
  if (process.env.SMTP_SECURE) {
    return process.env.SMTP_SECURE === "true";
  }

  return getSmtpPort() === 465;
}

function getMailFrom(): string | undefined {
  return process.env.SMTP_FROM || process.env.SMTP_USER;
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: getSmtpPort(),
    secure: getSmtpSecure(),
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
          }
        : undefined
  });
}

export async function sendRegistrationVerificationEmail({
  email,
  code
}: RegistrationVerificationEmail): Promise<EmailDeliveryResult> {
  const host = process.env.SMTP_HOST;
  const from = getMailFrom();

  if (!host || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured");
    }

    console.info(`[email verification] Code for ${email}: ${code}`);
    return { sent: false, devCode: code };
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from,
    to: email,
    subject: "Код підтвердження Zombie Event Shop",
    text: [
      "Привіт!",
      "",
      `Твій код підтвердження: ${code}`,
      "",
      `Код діє ${EMAIL_VERIFICATION_TTL_MINUTES} хвилин. Якщо ти не реєструвався на Zombie Event Shop, просто проігноруй цей лист.`
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h1 style="font-size: 22px;">Zombie Event Shop</h1>
        <p>Твій код підтвердження:</p>
        <p style="font-size: 30px; font-weight: 800; letter-spacing: 6px;">${code}</p>
        <p>Код діє ${EMAIL_VERIFICATION_TTL_MINUTES} хвилин.</p>
        <p style="color: #6b7280;">Якщо ти не реєструвався на Zombie Event Shop, просто проігноруй цей лист.</p>
      </div>
    `
  });

  return { sent: true };
}

export async function sendAdminLoginCodeEmail({ emails, code }: AdminLoginCodeEmail): Promise<EmailDeliveryResult> {
  const host = process.env.SMTP_HOST;
  const from = getMailFrom();
  const uniqueEmails = Array.from(new Set(emails.map((email) => email.trim()).filter(Boolean)));

  if (!uniqueEmails.length) {
    throw new Error("Admin 2FA email is not configured");
  }

  if (!host || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured");
    }

    console.info(`[admin 2fa] Code for ${uniqueEmails.join(", ")}: ${code}`);
    return { sent: false, devCode: code };
  }

  const transporter = createTransporter();

  await transporter.sendMail({
    from,
    to: uniqueEmails.join(", "),
    subject: "Код входу в адмінку Zombie Event Shop",
    text: [
      "Привіт!",
      "",
      `Код входу в адмінку: ${code}`,
      "",
      "Код діє 10 хвилин. Якщо це був не ти, терміново зміни ADMIN_PASSWORD / ADMIN_PASSWORDS і ADMIN_SESSION_SECRET."
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h1 style="font-size: 22px;">Zombie Event Shop Admin</h1>
        <p>Код входу в адмінку:</p>
        <p style="font-size: 30px; font-weight: 800; letter-spacing: 6px;">${code}</p>
        <p>Код діє 10 хвилин.</p>
        <p style="color: #6b7280;">Якщо це був не ти, терміново зміни ADMIN_PASSWORD / ADMIN_PASSWORDS і ADMIN_SESSION_SECRET.</p>
      </div>
    `
  });

  return { sent: true };
}
