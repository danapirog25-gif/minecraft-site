import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, normalizeEmail, setUserCookie } from "@/lib/user-auth";

export const runtime = "nodejs";

const registerSchema = z.object({
  email: z.string().email("Введи коректний email").max(120),
  password: z.string().min(8, "Пароль має містити мінімум 8 символів").max(72),
  minecraftNickname: z.string().regex(/^[A-Za-z0-9_]{3,16}$/, "Некоректний Minecraft-нік"),
  contact: z.string().trim().max(80).optional()
});

export async function POST(request: Request) {
  const parsed = registerSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Некоректні дані" }, { status: 400 });
  }

  const email = normalizeEmail(parsed.data.email);
  const contact = parsed.data.contact?.trim() || null;

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hashPassword(parsed.data.password),
        minecraftNickname: parsed.data.minecraftNickname.trim(),
        contact
      },
      select: {
        id: true,
        email: true,
        minecraftNickname: true,
        contact: true
      }
    });

    const response = NextResponse.json({ user });
    setUserCookie(response, user.id);
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = Array.isArray(error.meta?.target) ? error.meta?.target.join(", ") : "";
      const message = target.includes("minecraftNickname")
        ? "Такий Minecraft-нік уже зареєстрований"
        : "Такий email уже зареєстрований";
      return NextResponse.json({ error: message }, { status: 409 });
    }

    console.error("register user failed", error);
    return NextResponse.json({ error: "Не вдалося створити акаунт" }, { status: 500 });
  }
}
