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
    select: {
      id: true,
      email: true,
      minecraftNickname: true,
      contact: true,
      balance: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      orders: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          playerNickname: true,
          contact: true,
          email: true,
          products: true,
          totalAmount: true,
          status: true,
          paymentMethod: true,
          monoInvoiceId: true,
          monoPaymentUrl: true,
          createdAt: true,
          paidAt: true,
          issuedAt: true
        }
      },
      currencyTopUps: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          packageId: true,
          amountTalers: true,
          amountKopiyky: true,
          status: true,
          monoInvoiceId: true,
          monoPaymentUrl: true,
          createdAt: true,
          paidAt: true
        }
      },
      walletTransactions: {
        orderBy: { createdAt: "desc" },
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
