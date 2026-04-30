import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

type IssueRouteProps = {
  params: {
    id: string;
  };
};

export async function POST(_request: Request, { params }: IssueRouteProps) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const order = await prisma.order.findUnique({
    where: {
      id: params.id
    }
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (!["pending", "paid"].includes(order.status)) {
    return NextResponse.json({ error: "Можна видати тільки замовлення, що очікує видачі" }, { status: 400 });
  }

  const updatedOrder = await prisma.order.update({
    where: {
      id: order.id
    },
    data: {
      status: "issued",
      issuedAt: new Date()
    }
  });

  return NextResponse.json({ order: updatedOrder });
}
