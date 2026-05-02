import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { completeCurrencyTopUp, WalletError } from "@/lib/wallet";

type TopUpIssueRouteProps = {
  params: {
    id: string;
  };
};

export async function POST(_request: Request, { params }: TopUpIssueRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const topUp = await completeCurrencyTopUp(params.id);

    return NextResponse.json({ topUp });
  } catch (error) {
    if (error instanceof WalletError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "NOT_FOUND" ? 404 : 400 });
    }

    console.error("admin top-up issue failed", error);
    return NextResponse.json({ error: "Не вдалося видати талери" }, { status: 500 });
  }
}
