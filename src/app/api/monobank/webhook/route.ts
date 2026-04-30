import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapMonobankStatus, verifyMonoWebhookSignature } from "@/lib/monobank";
import { completeCurrencyTopUp, WalletError } from "@/lib/wallet";

export const runtime = "nodejs";

type MonobankWebhook = {
  invoiceId?: string;
  status?: string;
  amount?: number;
  finalAmount?: number;
  modifiedDate?: string;
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-sign");

  const isSignatureValid = await verifyMonoWebhookSignature(rawBody, signature);
  if (!isSignatureValid) {
    console.error("monobank webhook rejected: invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: MonobankWebhook;
  try {
    payload = JSON.parse(rawBody) as MonobankWebhook;
  } catch (error) {
    console.error("monobank webhook rejected: invalid json", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.invoiceId || !payload.status) {
    console.error("monobank webhook rejected: missing invoiceId or status", payload);
    return NextResponse.json({ error: "Missing invoiceId or status" }, { status: 400 });
  }

  const topUp = await prisma.currencyTopUp.findUnique({
    where: {
      monoInvoiceId: payload.invoiceId
    }
  });

  const nextStatus = mapMonobankStatus(payload.status);
  const receivedAmount = payload.finalAmount ?? payload.amount;

  if (topUp) {
    if (nextStatus === "pending") {
      return NextResponse.json({ ok: true });
    }

    if (nextStatus === "paid") {
      try {
        await completeCurrencyTopUp(topUp.id, receivedAmount);
      } catch (error) {
        if (error instanceof WalletError && error.code === "AMOUNT_MISMATCH") {
          console.error("monobank webhook top-up amount mismatch", {
            topUpId: topUp.id,
            expected: topUp.amountKopiyky,
            received: receivedAmount
          });

          return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
        }

        throw error;
      }

      return NextResponse.json({ ok: true });
    }

    await prisma.currencyTopUp.update({
      where: { id: topUp.id },
      data: {
        status: "failed"
      }
    });

    return NextResponse.json({ ok: true });
  }

  const order = await prisma.order.findUnique({
    where: {
      monoInvoiceId: payload.invoiceId
    }
  });

  if (!order) {
    console.error("monobank webhook ignored: order not found", payload.invoiceId);
    return NextResponse.json({ ok: true });
  }

  if (nextStatus === "paid" && receivedAmount !== order.totalAmount) {
    console.error("monobank webhook amount mismatch", {
      orderId: order.id,
      expected: order.totalAmount,
      received: receivedAmount
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: "failed"
      }
    });

    return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
  }

  if (nextStatus === "pending") {
    return NextResponse.json({ ok: true });
  }

  await prisma.order.update({
    where: { id: order.id },
    data:
      nextStatus === "paid"
        ? {
            status: "paid",
            paidAt: order.paidAt ?? new Date()
          }
        : {
            status: "failed"
          }
  });

  return NextResponse.json({ ok: true });
}
