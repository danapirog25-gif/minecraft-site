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

const JAR_PENDING_TTL_MS = 2 * 60 * 60 * 1000;
const JAR_MIN_AMOUNT_OFFSET_KOPIYKY = 1;
const JAR_MAX_AMOUNT_OFFSET_KOPIYKY = 99;

async function getUniqueJarPaymentAmount(baseAmountKopiyky: number): Promise<number> {
  const staleBefore = new Date(Date.now() - JAR_PENDING_TTL_MS);

  await prisma.currencyTopUp.updateMany({
    where: {
      status: "pending",
      monoInvoiceId: null,
      jarCommentCode: {
        not: null
      },
      createdAt: {
        lt: staleBefore
      }
    },
    data: {
      status: "failed"
    }
  });

  const activeTopUps = await prisma.currencyTopUp.findMany({
    where: {
      status: "pending",
      monoInvoiceId: null,
      jarCommentCode: {
        not: null
      },
      amountKopiyky: {
        gte: baseAmountKopiyky + JAR_MIN_AMOUNT_OFFSET_KOPIYKY,
        lte: baseAmountKopiyky + JAR_MAX_AMOUNT_OFFSET_KOPIYKY
      }
    },
    select: {
      amountKopiyky: true
    }
  });

  const usedAmounts = new Set(activeTopUps.map((topUp) => topUp.amountKopiyky));

  for (let offset = JAR_MIN_AMOUNT_OFFSET_KOPIYKY; offset <= JAR_MAX_AMOUNT_OFFSET_KOPIYKY; offset += 1) {
    const candidateAmount = baseAmountKopiyky + offset;

    if (!usedAmounts.has(candidateAmount)) {
      return candidateAmount;
    }
  }

  throw new Error("No available unique monobank jar amount");
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

  if (isMonoJarMode()) {
    try {
      const commentCode = createJarCommentCode();
      const paymentAmountKopiyky = await getUniqueJarPaymentAmount(pack.amountKopiyky);
      const topUp = await prisma.currencyTopUp.create({
        data: {
          userId: user.id,
          packageId: pack.id,
          amountTalers: pack.talers,
          amountKopiyky: paymentAmountKopiyky,
          status: "pending",
          monoPaymentUrl: getMonoJarPaymentUrl(paymentAmountKopiyky),
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
