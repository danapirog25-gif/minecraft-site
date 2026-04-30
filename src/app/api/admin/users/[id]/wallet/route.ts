import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { formatTalers } from "@/lib/currency";
import { adjustUserBalance, WalletError } from "@/lib/wallet";

type WalletRouteProps = {
  params: {
    id: string;
  };
};

const adjustmentSchema = z.object({
  amount: z.number().int().refine((value) => value !== 0, "Сума не може бути нульовою"),
  reason: z.string().max(180).optional()
});

export async function POST(request: Request, { params }: WalletRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const parsed = adjustmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Некоректна сума" }, { status: 400 });
  }

  try {
    const amount = parsed.data.amount;
    const user = await adjustUserBalance({
      userId: params.id,
      amount,
      description:
        amount > 0
          ? `Адміністратор видав ${formatTalers(amount)}`
          : `Адміністратор списав ${formatTalers(Math.abs(amount))}`,
      adminNote: parsed.data.reason
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof WalletError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "NOT_FOUND" ? 404 : 400 });
    }

    console.error("admin wallet adjustment failed", error);
    return NextResponse.json({ error: "Не вдалося змінити баланс" }, { status: 500 });
  }
}
