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

type JarWebhookRouteProps = {
  params: {
    secret: string;
  };
};

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

  const commentCode = extractJarCommentCode(statementItem.comment);
  if (!commentCode) {
    console.error("monobank jar webhook ignored: missing comment code", {
      statementItemId: statementItem.id,
      comment: statementItem.comment
    });
    return NextResponse.json({ ok: true });
  }

  const topUp = await prisma.currencyTopUp.findFirst({
    where: {
      jarCommentCode: commentCode
    }
  });

  if (!topUp) {
    console.error("monobank jar webhook ignored: top-up not found", {
      statementItemId: statementItem.id,
      commentCode
    });
    return NextResponse.json({ ok: true });
  }

  if (topUp.status === "paid") {
    await prisma.currencyTopUp
      .update({
        where: { id: topUp.id },
        data: { jarStatementItemId: statementItem.id }
      })
      .catch(() => null);
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
    await prisma.currencyTopUp.update({
      where: { id: topUp.id },
      data: {
        jarStatementItemId: statementItem.id
      }
    });
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
