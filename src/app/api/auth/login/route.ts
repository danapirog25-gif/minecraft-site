import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, setUserCookie, verifyPassword } from "@/lib/user-auth";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email("Введи коректний email").max(120),
  password: z.string().min(1, "Введи пароль")
});

export async function POST(request: Request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Некоректні дані" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(parsed.data.email) },
    select: {
      id: true,
      email: true,
      minecraftNickname: true,
      contact: true,
      passwordHash: true
    }
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Неправильний email або пароль" }, { status: 401 });
  }

  const response = NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      minecraftNickname: user.minecraftNickname,
      contact: user.contact
    }
  });
  setUserCookie(response, user.id);
  return response;
}
