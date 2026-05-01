import { NextResponse } from "next/server";
import {
  extractJarCommentCode,
  getMonoPersonalWebhookSecret,
  isExpectedMonoJarAccount,
  MonoJarWebhookPayload
} from "@/lib/monobank-jar";
import { prisma } from "@/lib/prisma";
import { completeCurrencyTopUp, WalletError } from "@/lib/wallet";

export const runtime = "nodejs";

const JAR_AMOUNT_MATCH_WINDOW_MS = 6 * 60 * 60 * 1000;
const JAR_AMOUNT_MATCH_FUTURE_DRIFT_MS = 5 * 60 * 1000;

type JarWebhookRouteProps = {
  params: {
    secret: string;
  };
};

type JarTopUpForWebhook = NonNullable<Awaited<ReturnType<typeof findTopUpByCommentOrAmount>>>;

function isWebhookSecretValid(secret: string): boolean {
  try {
    return secret === getMonoPersonalWebhookSecret();
  } catch {
    return false;
  }
}

export async function GET(_request: Request, { params }: JarWebhookRouteProps) {
  if (!isWebhookSecretValid(params.secret)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 200 });
}

async function findTopUpByCommentOrAmount(statementItem: NonNullable<MonoJarWebhookPayload["data"]>["statementItem"]) {
  if (!statementItem?.id) {
    return null;
  }

  const commentCode = extractJarCommentCode(statementItem.comment);

  if (commentCode) {
    const topUp = await prisma.currencyTopUp.findFirst({
      where: {
        jarCommentCode: commentCode
      }
    });

    if (topUp) {
      return topUp;
    }

    console.error("monobank jar webhook comment code not found, trying amount fallback", {
      statementItemId: statementItem.id,
      commentCode
    });
  }

  const paidAt = statementItem.time ? new Date(statementItem.time * 1000) : new Date();
  const candidates = await prisma.currencyTopUp.findMany({
    where: {
      status: "pending",
      monoInvoiceId: null,
      jarCommentCode: {
        not: null
      },
      jarStatementItemId: null,
      amountKopiyky: statementItem.amount,
      createdAt: {
        gte: new Date(paidAt.getTime() - JAR_AMOUNT_MATCH_WINDOW_MS),
        lte: new Date(paidAt.getTime() + JAR_AMOUNT_MATCH_FUTURE_DRIFT_MS)
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 2
  });

  if (candidates.length === 1) {
    return candidates[0];
  }

  console.error("monobank jar webhook ignored: amount fallback did not find a unique top-up", {
    statementItemId: statementItem.id,
    amount: statementItem.amount,
    comment: statementItem.comment,
    candidates: candidates.map((topUp) => topUp.id)
  });

  return null;
}

async function attachStatementItem(topUp: JarTopUpForWebhook, statementItemId: string) {
  await prisma.currencyTopUp
    .update({
      where: { id: topUp.id },
      data: { jarStatementItemId: statementItemId }
    })
    .catch(() => null);
}

export async function POST(request: Request, { params }: JarWebhookRouteProps) {
  if (!isWebhookSecretValid(params.secret)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let payload: MonoJarWebhookPayload;
  try {
    payload = (await request.json()) as MonoJarWebhookPayload;
  } catch (error) {
    console.error("monobank jar webhook rejected: invalid json", error);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (payload.type !== "StatementItem") {
    return NextResponse.json({ ok: true });
  }

  const account = payload.data?.account;
  const statementItem = payload.data?.statementItem;

  if (!statementItem?.id || !(await isExpectedMonoJarAccount(account))) {
    return NextResponse.json({ ok: true });
  }

  if (statementItem.hold || statementItem.currencyCode !== 980 || statementItem.amount <= 0) {
    return NextResponse.json({ ok: true });
  }

  const existingTopUp = await prisma.currencyTopUp.findFirst({
    where: {
      jarStatementItemId: statementItem.id
    },
    select: {
      id: true
    }
  });

  if (existingTopUp) {
    return NextResponse.json({ ok: true });
  }

  const topUp = await findTopUpByCommentOrAmount(statementItem);
  if (!topUp) {
    return NextResponse.json({ ok: true });
  }

  if (topUp.status === "paid") {
    await attachStatementItem(topUp, statementItem.id);
    return NextResponse.json({ ok: true });
  }

  if (statementItem.amount !== topUp.amountKopiyky) {
    console.error("monobank jar webhook amount mismatch", {
      topUpId: topUp.id,
      expected: topUp.amountKopiyky,
      received: statementItem.amount,
      statementItemId: statementItem.id
    });
    return NextResponse.json({ ok: true });
  }

  try {
    await completeCurrencyTopUp(topUp.id, statementItem.amount);
    await attachStatementItem(topUp, statementItem.id);
  } catch (error) {
    if (error instanceof WalletError) {
      console.error("monobank jar webhook wallet error", {
        topUpId: topUp.id,
        code: error.code,
        message: error.message
      });
      return NextResponse.json({ ok: true });
    }

    throw error;
  }

  return NextResponse.json({ ok: true });
}
