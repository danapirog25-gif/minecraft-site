import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const url = new URL(request.url);
  const query = url.searchParams.get("query")?.trim();

  const users = await prisma.user.findMany({
    where: query
      ? {
          OR: [
            { minecraftNickname: { contains: query } },
            { email: { contains: query } }
          ]
        }
      : {},
    orderBy: {
      createdAt: "desc"
    },
    take: query ? 20 : 12,
    select: {
      id: true,
      email: true,
      minecraftNickname: true,
      contact: true,
      balance: true,
      createdAt: true,
      orders: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          products: true,
          totalAmount: true,
          status: true,
          createdAt: true
        }
      },
      currencyTopUps: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          packageId: true,
          amountTalers: true,
          amountKopiyky: true,
          status: true,
          createdAt: true,
          paidAt: true
        }
      },
      walletTransactions: {
        orderBy: { createdAt: "desc" },
        take: 16,
        select: {
          id: true,
          type: true,
          amount: true,
          balanceAfter: true,
          description: true,
          adminNote: true,
          orderId: true,
          topUpId: true,
          createdAt: true
        }
      }
    }
  });

  return NextResponse.json({ users });
}
