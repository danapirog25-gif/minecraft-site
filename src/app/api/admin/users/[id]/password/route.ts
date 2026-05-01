import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/user-auth";

type PasswordRouteProps = {
  params: {
    id: string;
  };
};

const passwordSchema = z.object({
  password: z.string().min(8, "Пароль має містити мінімум 8 символів").max(72)
});

export async function PATCH(request: Request, { params }: PasswordRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const parsed = passwordSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Некоректний пароль" }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        passwordHash: await hashPassword(parsed.data.password)
      },
      select: {
        id: true,
        email: true,
        minecraftNickname: true
      }
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Гравця не знайдено" }, { status: 404 });
    }

    console.error("admin reset user password failed", error);
    return NextResponse.json({ error: "Не вдалося оновити пароль" }, { status: 500 });
  }
}
