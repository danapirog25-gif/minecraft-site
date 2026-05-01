import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type UserRouteProps = {
  params: {
    id: string;
  };
};

export async function DELETE(_request: Request, { params }: UserRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const user = await prisma.user.delete({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        minecraftNickname: true
      }
    });

    await prisma.emailVerificationCode
      .deleteMany({
        where: {
          OR: [{ email: user.email }, { minecraftNickname: user.minecraftNickname }]
        }
      })
      .catch(() => null);

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Гравця не знайдено" }, { status: 404 });
    }

    console.error("admin delete user failed", error);
    return NextResponse.json({ error: "Не вдалося видалити акаунт" }, { status: 500 });
  }
}
