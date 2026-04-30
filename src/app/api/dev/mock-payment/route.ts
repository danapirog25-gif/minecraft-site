import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppUrl, isMonoMockMode } from "@/lib/monobank";
import { completeCurrencyTopUp } from "@/lib/wallet";

export const runtime = "nodejs";

export async function GET(request: Request) {
  if (!isMonoMockMode()) {
    return NextResponse.json({ error: "Mock payments are disabled" }, { status: 404 });
  }

  const url = new URL(request.url);
  const topUpId = url.searchParams.get("topUpId");
  const orderId = url.searchParams.get("orderId");

  if (topUpId) {
    const topUp = await prisma.currencyTopUp.findUnique({
      where: {
        id: topUpId
      }
    });

    if (!topUp) {
      return NextResponse.redirect(`${getAppUrl()}/payment/failed`);
    }

    await completeCurrencyTopUp(topUp.id, topUp.amountKopiyky);

    return NextResponse.redirect(`${getAppUrl()}/payment/success?topUpId=${encodeURIComponent(topUp.id)}&mock=1`);
  }

  if (!orderId) {
    return NextResponse.redirect(`${getAppUrl()}/payment/failed`);
  }

  const order = await prisma.order.findUnique({
    where: {
      id: orderId
    }
  });

  if (!order) {
    return NextResponse.redirect(`${getAppUrl()}/payment/failed`);
  }

  await prisma.order.update({
    where: {
      id: order.id
    },
    data: {
      status: "paid",
      paidAt: order.paidAt ?? new Date()
    }
  });

  return NextResponse.redirect(`${getAppUrl()}/payment/success?orderId=${encodeURIComponent(order.id)}&mock=1`);
}
