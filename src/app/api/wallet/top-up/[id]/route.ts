import { NextResponse } from "next/server";
import { extractJarCommentCode, fetchMonoJarStatement } from "@/lib/monobank-jar";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { completeCurrencyTopUp, WalletError } from "@/lib/wallet";

export const runtime = "nodejs";

type TopUpStatusRouteProps = {
  params: {
    id: string;
  };
};

type TopUpForStatus = {
  id: string;
  amountTalers: number;
  amountKopiyky: number;
  status: string;
  paidAt: Date | null;
  createdAt: Date;
  jarCommentCode: string | null;
};

function toPublicTopUp(topUp: TopUpForStatus) {
  return {
    id: topUp.id,
    amountTalers: topUp.amountTalers,
    amountKopiyky: topUp.amountKopiyky,
    status: topUp.status,
    paidAt: topUp.paidAt
  };
}

async function checkJarStatementForPayment(topUp: TopUpForStatus): Promise<TopUpForStatus | null> {
  if (topUp.status !== "pending" || !topUp.jarCommentCode) {
    return null;
  }

  const from = Math.max(0, Math.floor(topUp.createdAt.getTime() / 1000) - 15 * 60);
  const to = Math.floor(Date.now() / 1000);
  const statementItems = await fetchMonoJarStatement(from, to);

  const matchingItem = statementItems.find((item) => {
    if (!item.id || item.hold || item.currencyCode !== 980 || item.amount <= 0) {
      return false;
    }

    return extractJarCommentCode(item.comment) === topUp.jarCommentCode;
  });

  if (!matchingItem) {
    return null;
  }

  if (matchingItem.amount !== topUp.amountKopiyky) {
    throw new WalletError("AMOUNT_MISMATCH", "Сума платежу не збігається з обраним пакетом");
  }

  const existingTopUp = await prisma.currencyTopUp.findFirst({
    where: {
      jarStatementItemId: matchingItem.id,
      NOT: {
        id: topUp.id
      }
    },
    select: {
      id: true
    }
  });

  if (existingTopUp) {
    throw new WalletError("AMOUNT_MISMATCH", "Цей платіж уже прив'язаний до іншого поповнення");
  }

  await completeCurrencyTopUp(topUp.id, matchingItem.amount);

  return prisma.currencyTopUp.update({
    where: {
      id: topUp.id
    },
    data: {
      jarStatementItemId: matchingItem.id
    },
    select: {
      id: true,
      amountTalers: true,
      amountKopiyky: true,
      status: true,
      paidAt: true,
      createdAt: true,
      jarCommentCode: true
    }
  });
}

export async function GET(request: Request, { params }: TopUpStatusRouteProps) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Увійдіть в акаунт, щоб перевірити оплату" }, { status: 401 });
  }

  let topUp = await prisma.currencyTopUp.findFirst({
    where: {
      id: params.id,
      userId: user.id
    },
    select: {
      id: true,
      amountTalers: true,
      amountKopiyky: true,
      status: true,
      paidAt: true,
      createdAt: true,
      jarCommentCode: true
    }
  });

  if (!topUp) {
    return NextResponse.json({ error: "Поповнення не знайдено" }, { status: 404 });
  }

  const shouldCheckProvider = new URL(request.url).searchParams.get("check") === "1";

  if (shouldCheckProvider) {
    try {
      const checkedTopUp = await checkJarStatementForPayment(topUp);
      if (checkedTopUp) {
        topUp = checkedTopUp;
      }
    } catch (error) {
      if (error instanceof WalletError) {
        return NextResponse.json({ topUp: toPublicTopUp(topUp), error: error.message }, { status: 409 });
      }

      console.error("manual monobank jar top-up check failed", {
        topUpId: topUp.id,
        error
      });

      return NextResponse.json(
        {
          topUp: toPublicTopUp(topUp),
          error: "Не вдалося перевірити виписку monobank. Спробуйте ще раз за хвилину."
        },
        { status: 502 }
      );
    }
  }

  return NextResponse.json({ topUp: toPublicTopUp(topUp) });
}
