import { NextResponse } from "next/server";
import { z } from "zod";
import { formatTalers, getTopUpPackage } from "@/lib/currency";
import { createMonoInvoice, getMonoJarPaymentUrl, isMonoJarMode } from "@/lib/monobank";
import { createJarCommentCode } from "@/lib/monobank-jar";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";

export const runtime = "nodejs";

const topUpSchema = z.object({
  packageId: z.string().min(1)
});

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

  if (isMonoJarMode()) {
    try {
      const commentCode = createJarCommentCode();
      const topUp = await prisma.currencyTopUp.create({
        data: {
          userId: user.id,
          packageId: pack.id,
          amountTalers: pack.talers,
          amountKopiyky: pack.amountKopiyky,
          status: "pending",
          monoPaymentUrl: getMonoJarPaymentUrl(),
          jarCommentCode: commentCode
        }
      });

      return NextResponse.json({
        topUpId: topUp.id,
        paymentUrl: topUp.monoPaymentUrl,
        paymentComment: commentCode,
        amountKopiyky: topUp.amountKopiyky,
        amountTalers: topUp.amountTalers
      });
    } catch (error) {
      console.error("create monobank jar top-up failed", error);
      return NextResponse.json({ error: "Не вдалося створити поповнення через банку" }, { status: 502 });
    }
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

  try {
    const invoice = await createMonoInvoice({
      orderId: topUp.id,
      amount: pack.amountKopiyky,
      destination: `Поповнення балансу Zombie Event Shop: ${formatTalers(pack.talers)}`,
      basketOrder: [
        {
          name: formatTalers(pack.talers),
          qty: 1,
          sum: pack.amountKopiyky,
          code: pack.id
        }
      ],
      redirectPath: `/payment/success?topUpId=${encodeURIComponent(topUp.id)}`,
      mockPaymentPath: `/api/dev/mock-payment?topUpId=${encodeURIComponent(topUp.id)}`
    });

    await prisma.currencyTopUp.update({
      where: { id: topUp.id },
      data: {
        monoInvoiceId: invoice.invoiceId,
        monoPaymentUrl: invoice.pageUrl
      }
    });

    return NextResponse.json({
      topUpId: topUp.id,
      paymentUrl: invoice.pageUrl
    });
  } catch (error) {
    console.error("create monobank top-up invoice failed", error);

    await prisma.currencyTopUp.update({
      where: { id: topUp.id },
      data: {
        status: "failed"
      }
    });

    return NextResponse.json({ error: "Не вдалося створити оплату monobank" }, { status: 502 });
  }
}
