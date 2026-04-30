import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdminAuthenticated, unauthorizedResponse } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const batchOrderSchema = z.object({
  action: z.enum(["issue"]),
  orderIds: z.array(z.string().min(1)).min(1).max(100)
});

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse();
  }

  const parsed = batchOrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Некоректний batch-запит" }, { status: 400 });
  }

  const orderIds = Array.from(new Set(parsed.data.orderIds));

  const result = await prisma.order.updateMany({
    where: {
      id: {
        in: orderIds
      },
      status: {
        in: ["pending", "paid"]
      }
    },
    data: {
      status: "issued",
      issuedAt: new Date()
    }
  });

  return NextResponse.json({ updatedCount: result.count });
}
