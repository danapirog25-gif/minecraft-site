import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { cancelOrderWithRefund, WalletError } from "@/lib/wallet";

type CancelRouteProps = {
  params: {
    id: string;
  };
};

export async function POST(_request: Request, { params }: CancelRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  try {
    const updatedOrder = await cancelOrderWithRefund(params.id);
    return NextResponse.json({ order: updatedOrder });
  } catch (error) {
    if (error instanceof WalletError) {
      return NextResponse.json({ error: error.message }, { status: error.code === "NOT_FOUND" ? 404 : 400 });
    }

    console.error("admin cancel order failed", error);
    return NextResponse.json({ error: "Не вдалося скасувати замовлення" }, { status: 500 });
  }
}
