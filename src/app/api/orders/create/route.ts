import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toProductSnapshot } from "@/lib/catalog";
import { notifyOrderCreated } from "@/lib/notifications";
import { getCurrentUser } from "@/lib/user-auth";
import { WalletError } from "@/lib/wallet";

export const runtime = "nodejs";

const createOrderSchema = z.object({
  productId: z.string().min(1).optional(),
  productIds: z.array(z.string().min(1)).min(1).max(24).optional(),
  contact: z.string().min(3).max(80)
}).refine((value) => Boolean(value.productId || value.productIds?.length), {
  message: "Оберіть хоча б один товар"
});

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Увійдіть в акаунт, щоб купувати товари за талери" }, { status: 401 });
  }

  const parsed = createOrderSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Некоректні дані" }, { status: 400 });
  }

  const requestedProductIds = parsed.data.productIds?.length
    ? parsed.data.productIds
    : parsed.data.productId
      ? [parsed.data.productId]
      : [];
  const productIds = Array.from(new Set(requestedProductIds));

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds
      },
      isActive: true
    }
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: "Один або кілька товарів уже недоступні" }, { status: 404 });
  }

  const orderedProducts = productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is (typeof products)[number] => Boolean(product));
  const snapshots = orderedProducts.map(toProductSnapshot);
  const totalAmount = orderedProducts.reduce((sum, product) => sum + product.price, 0);
  const orderDescription =
    orderedProducts.length === 1
      ? `Покупка товару: ${orderedProducts[0].name}`
      : `Покупка кошика: ${orderedProducts.length} товарів`;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const debit = await tx.user.updateMany({
        where: {
          id: user.id,
          balance: {
            gte: totalAmount
          }
        },
        data: {
          balance: {
            decrement: totalAmount
          },
          contact: parsed.data.contact.trim()
        }
      });

      if (debit.count !== 1) {
        throw new WalletError(
          "INSUFFICIENT_FUNDS",
          "Недостатньо талерів для покупки."
        );
      }

      const account = await tx.user.findUnique({
        where: { id: user.id },
        select: { balance: true }
      });

      const createdOrder = await tx.order.create({
        data: {
          playerNickname: user.minecraftNickname,
          contact: parsed.data.contact.trim(),
          email: user.email,
          userId: user.id,
          products: JSON.stringify(snapshots),
          totalAmount,
          status: "pending",
          paymentMethod: "wallet"
        }
      });

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          type: "purchase",
          amount: -totalAmount,
          balanceAfter: account?.balance ?? 0,
          description: orderDescription,
          orderId: createdOrder.id
        }
      });

      return createdOrder;
    });

    await notifyOrderCreated({
      orderId: order.id,
      playerNickname: order.playerNickname,
      contact: order.contact,
      totalAmount: order.totalAmount,
      products: snapshots
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    if (error instanceof WalletError && error.code === "INSUFFICIENT_FUNDS") {
      return NextResponse.json({ error: error.message }, { status: 402 });
    }

    console.error("create wallet order failed", error);
    return NextResponse.json({ error: "Не вдалося створити замовлення" }, { status: 500 });
  }
}
