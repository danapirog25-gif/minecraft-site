import { NextResponse } from "next/server";
import { z } from "zod";
import { getTopUpPackage } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";

const topUpSchema = z.object({
  packageId: z.string().min(1)
});

function getManualPaymentUrl() {
  const configuredUrl = process.env.MANUAL_TOP_UP_PAYMENT_URL?.trim();
  if (configuredUrl) {
    return configuredUrl;
  }

  const monoJarSendId = (process.env.MONOBANK_JAR_SEND_ID || process.env.MONOBANK_JAR_ID)?.trim();
  return monoJarSendId ? `https://send.monobank.ua/jar/${monoJarSendId}` : null;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Увійдіть в акаунт, щоб поповнити баланс" }, { status: 401 });
  }

  const parsed = topUpSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некоректний пакет поповнення" }, { status: 400 });
  }

  const pack = getTopUpPackage(parsed.data.packageId);
  if (!pack) {
    return NextResponse.json({ error: "Такий пакет поповнення недоступний" }, { status: 404 });
  }

  const topUp = await prisma.currencyTopUp.create({
    data: {
      userId: user.id,
      packageId: pack.id,
      amountTalers: pack.talers,
      amountKopiyky: pack.amountKopiyky,
      status: "pending"
    }
  });

  return NextResponse.json({
    topUpId: topUp.id,
    paymentUrl: getManualPaymentUrl(),
    paymentComment: user.minecraftNickname,
    amountKopiyky: topUp.amountKopiyky,
    amountTalers: topUp.amountTalers
  });
}
