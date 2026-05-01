import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createEmailVerificationCode,
  EMAIL_VERIFICATION_MAX_ATTEMPTS,
  EMAIL_VERIFICATION_TTL_MINUTES,
  getEmailVerificationExpiresAt,
  hashEmailVerificationCode,
  isEmailVerificationCodeValid
} from "@/lib/email-verification";
import { sendRegistrationVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { hashPassword, normalizeEmail, setUserCookie } from "@/lib/user-auth";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().email("Введи коректний email").max(120),
  password: z.string().min(8, "Пароль має містити мінімум 8 символів").max(72),
  minecraftNickname: z.string().regex(/^[A-Za-z0-9_]{3,16}$/, "Некоректний Minecraft-нік"),
  contact: z.string().trim().max(80).optional()
});

const verifySchema = z.object({
  email: z.string().email("Введи коректний email").max(120),
  code: z.string().trim().regex(/^\d{6}$/, "Введи 6-значний код з листа")
});

function getUniqueConflictMessage(error: Prisma.PrismaClientKnownRequestError): string {
  const target = Array.isArray(error.meta?.target) ? error.meta?.target.join(", ") : "";

  if (target.includes("minecraftNickname")) {
    return "Такий Minecraft-нік уже зареєстрований або очікує підтвердження";
  }

  return "Такий email уже зареєстрований";
}

async function getExistingRegistrationConflict(email: string, minecraftNickname: string): Promise<string | null> {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { minecraftNickname }]
    },
    select: {
      email: true,
      minecraftNickname: true
    }
  });

  if (!existingUser) {
    return null;
  }

  return existingUser.email === email
    ? "Такий email уже зареєстрований"
    : "Такий Minecraft-нік уже зареєстрований";
}

async function requestVerification(body: unknown) {
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Некоректні дані" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const minecraftNickname = parsed.data.minecraftNickname.trim();
  const contact = parsed.data.contact?.trim() || null;
  const now = new Date();

  await prisma.emailVerificationCode.deleteMany({
    where: {
      expiresAt: { lte: now }
    }
  });

  const existingConflict = await getExistingRegistrationConflict(email, minecraftNickname);
  if (existingConflict) {
    return NextResponse.json({ error: existingConflict }, { status: 409 });
  }

  const pendingNickname = await prisma.emailVerificationCode.findFirst({
    where: {
      minecraftNickname,
      NOT: { email }
    },
    select: { id: true }
  });

  if (pendingNickname) {
    return NextResponse.json(
      { error: "Такий Minecraft-нік уже очікує підтвердження з іншої пошти" },
      { status: 409 }
    );
  }

  const code = createEmailVerificationCode();
  const passwordHash = await hashPassword(parsed.data.password);
  const codeHash = hashEmailVerificationCode(email, code);
  const expiresAt = getEmailVerificationExpiresAt(now);

  try {
    await prisma.emailVerificationCode.upsert({
      where: { email },
      create: {
        email,
        passwordHash,
        minecraftNickname,
        contact,
        codeHash,
        expiresAt
      },
      update: {
        passwordHash,
        minecraftNickname,
        contact,
        codeHash,
        attempts: 0,
        expiresAt
      }
    });

    const delivery = await sendRegistrationVerificationEmail({ email, code });

    return NextResponse.json({
      verificationRequired: true,
      email,
      expiresInMinutes: EMAIL_VERIFICATION_TTL_MINUTES,
      devCode: delivery.devCode
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: getUniqueConflictMessage(error) }, { status: 409 });
    }

    console.error("send registration verification failed", error);
    return NextResponse.json({ error: "Не вдалося надіслати код підтвердження" }, { status: 500 });
  }
}

async function verifyRegistration(body: unknown) {
  const parsed = verifySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Некоректні дані" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const code = parsed.data.code.trim();
  const pending = await prisma.emailVerificationCode.findUnique({
    where: { email }
  });

  if (!pending) {
    return NextResponse.json({ error: "Спочатку запроси код підтвердження" }, { status: 400 });
  }

  if (pending.expiresAt <= new Date()) {
    await prisma.emailVerificationCode.delete({ where: { email } }).catch(() => null);
    return NextResponse.json({ error: "Код підтвердження протермінований. Надішли новий код" }, { status: 400 });
  }

  if (pending.attempts >= EMAIL_VERIFICATION_MAX_ATTEMPTS) {
    await prisma.emailVerificationCode.delete({ where: { email } }).catch(() => null);
    return NextResponse.json({ error: "Забагато неправильних спроб. Надішли новий код" }, { status: 429 });
  }

  if (!isEmailVerificationCodeValid(email, code, pending.codeHash)) {
    await prisma.emailVerificationCode.update({
      where: { email },
      data: { attempts: { increment: 1 } }
    });

    return NextResponse.json({ error: "Невірний код підтвердження" }, { status: 400 });
  }

  const existingConflict = await getExistingRegistrationConflict(pending.email, pending.minecraftNickname);
  if (existingConflict) {
    await prisma.emailVerificationCode.delete({ where: { email } }).catch(() => null);
    return NextResponse.json({ error: existingConflict }, { status: 409 });
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email: pending.email,
          passwordHash: pending.passwordHash,
          minecraftNickname: pending.minecraftNickname,
          contact: pending.contact
        },
        select: {
          id: true,
          email: true,
          minecraftNickname: true,
          contact: true
        }
      });

      await tx.emailVerificationCode.delete({ where: { email } });
      return createdUser;
    });

    const response = NextResponse.json({ user });
    setUserCookie(response, user.id);
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: getUniqueConflictMessage(error) }, { status: 409 });
    }

    console.error("register verified user failed", error);
    return NextResponse.json({ error: "Не вдалося створити акаунт" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (body && typeof body === "object" && "code" in body) {
    return verifyRegistration(body);
  }

  return requestVerification(body);
}
