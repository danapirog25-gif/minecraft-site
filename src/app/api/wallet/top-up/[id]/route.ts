import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";

type TopUpStatusRouteProps = {
  params: {
    id: string;
  };
};

export async function GET(_request: Request, { params }: TopUpStatusRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Увійдіть в акаунт, щоб перевірити оплату" }, { status: 401 });
  }

  const topUp = await prisma.currencyTopUp.findFirst({
    where: {
      id: params.id,
      userId: user.id
    },
    select: {
      id: true,
      amountTalers: true,
      amountKopiyky: true,
      status: true,
      paidAt: true
    }
  });

  if (!topUp) {
    return NextResponse.json({ error: "Поповнення не знайдено" }, { status: 404 });
  }

  return NextResponse.json({ topUp });
}
