import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const orders = await prisma.order.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({ orders });
}
