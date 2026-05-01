import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type UserHistoryRouteProps = {
  params: {
    id: string;
  };
};

export async function DELETE(_request: Request, { params }: UserHistoryRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true }
  });

  if (!user) {
    return NextResponse.json({ error: "Гравця не знайдено" }, { status: 404 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const walletTransactions = await tx.walletTransaction.deleteMany({
        where: { userId: params.id }
      });

      const currencyTopUps = await tx.currencyTopUp.deleteMany({
        where: { userId: params.id }
      });

      const orders = await tx.order.updateMany({
        where: { userId: params.id },
        data: { userId: null }
      });

      return {
        walletTransactions: walletTransactions.count,
        currencyTopUps: currencyTopUps.count,
        orders: orders.count
      };
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("admin clear user history failed", error);
    return NextResponse.json({ error: "Не вдалося очистити історію гравця" }, { status: 500 });
  }
}
