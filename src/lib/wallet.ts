import { Prisma } from "@prisma/client";
import { formatTalers } from "@/lib/currency";
import { prisma } from "@/lib/prisma";

type TransactionClient = Prisma.TransactionClient;

export class WalletError extends Error {
  constructor(
    public code: "INSUFFICIENT_FUNDS" | "NOT_FOUND" | "AMOUNT_MISMATCH",
    message: string
  ) {
    super(message);
    this.name = "WalletError";
  }
}

async function changeBalance(tx: TransactionClient, userId: string, amount: number): Promise<number> {
  const result = await tx.user.updateMany({
    where: {
      id: userId,
      ...(amount < 0 ? { balance: { gte: Math.abs(amount) } } : {})
    },
    data: {
      balance: {
        increment: amount
      }
    }
  });

  if (result.count !== 1) {
    throw new WalletError(
      amount < 0 ? "INSUFFICIENT_FUNDS" : "NOT_FOUND",
      amount < 0 ? "Недостатньо валюти на балансі" : "Гравця не знайдено"
    );
  }

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { balance: true }
  });

  if (!user) {
    throw new WalletError("NOT_FOUND", "Гравця не знайдено");
  }

  return user.balance;
}

export async function completeCurrencyTopUp(topUpId: string, receivedAmount?: number) {
  let amountMismatchTopUpId: string | null = null;

  try {
    return await prisma.$transaction(async (tx) => {
      const topUp = await tx.currencyTopUp.findUnique({
        where: { id: topUpId }
      });

      if (!topUp) {
        throw new WalletError("NOT_FOUND", "Поповнення не знайдено");
      }

      if (topUp.status === "paid") {
        return topUp;
      }

      if (receivedAmount !== undefined && receivedAmount !== topUp.amountKopiyky) {
        amountMismatchTopUpId = topUp.id;
        throw new WalletError("AMOUNT_MISMATCH", "Сума платежу не збігається з пакетом талерів");
      }

      const claim = await tx.currencyTopUp.updateMany({
        where: {
          id: topUp.id,
          status: "pending"
        },
        data: {
          status: "paid",
          paidAt: topUp.paidAt ?? new Date()
        }
      });

      if (claim.count !== 1) {
        const currentTopUp = await tx.currencyTopUp.findUnique({
          where: { id: topUp.id }
        });

        if (currentTopUp) {
          return currentTopUp;
        }

        throw new WalletError("NOT_FOUND", "Поповнення не знайдено");
      }

      const balanceAfter = await changeBalance(tx, topUp.userId, topUp.amountTalers);

      await tx.walletTransaction.create({
        data: {
          userId: topUp.userId,
          type: "topup",
          amount: topUp.amountTalers,
          balanceAfter,
          description: `Поповнення через monobank: ${formatTalers(topUp.amountTalers)}`,
          topUpId: topUp.id
        }
      });

      const paidTopUp = await tx.currencyTopUp.findUnique({
        where: { id: topUp.id }
      });

      if (!paidTopUp) {
        throw new WalletError("NOT_FOUND", "Поповнення не знайдено");
      }

      return paidTopUp;
    });
  } catch (error) {
    if (error instanceof WalletError && error.code === "AMOUNT_MISMATCH" && amountMismatchTopUpId) {
      await prisma.currencyTopUp.updateMany({
        where: {
          id: amountMismatchTopUpId,
          status: "pending"
        },
        data: {
          status: "failed"
        }
      });
    }

    throw error;
  }
}

export async function adjustUserBalance(input: {
  userId: string;
  amount: number;
  description: string;
  adminNote?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const balanceAfter = await changeBalance(tx, input.userId, input.amount);

    await tx.walletTransaction.create({
      data: {
        userId: input.userId,
        type: "admin_adjustment",
        amount: input.amount,
        balanceAfter,
        description: input.description,
        adminNote: input.adminNote?.trim() || null
      }
    });

    return tx.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        email: true,
        minecraftNickname: true,
        contact: true,
        balance: true,
        createdAt: true
      }
    });
  });
}

export async function refundOrderBalance(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new WalletError("NOT_FOUND", "Замовлення не знайдено");
    }

    if (!order.userId || order.status === "cancelled" || order.paymentMethod !== "wallet") {
      return null;
    }

    const balanceAfter = await changeBalance(tx, order.userId, order.totalAmount);

    await tx.walletTransaction.create({
      data: {
        userId: order.userId,
        type: "refund",
        amount: order.totalAmount,
        balanceAfter,
        description: `Повернення за скасоване замовлення: ${formatTalers(order.totalAmount)}`,
        orderId: order.id
      }
    });

    return { order, balanceAfter };
  });
}

export async function cancelOrderWithRefund(orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      throw new WalletError("NOT_FOUND", "Замовлення не знайдено");
    }

    if (order.status === "issued") {
      throw new WalletError("NOT_FOUND", "Видані замовлення не можна скасувати");
    }

    if (order.status === "cancelled") {
      return order;
    }

    if (order.userId && order.paymentMethod === "wallet") {
      const balanceAfter = await changeBalance(tx, order.userId, order.totalAmount);

      await tx.walletTransaction.create({
        data: {
          userId: order.userId,
          type: "refund",
          amount: order.totalAmount,
          balanceAfter,
          description: `Повернення за скасоване замовлення: ${formatTalers(order.totalAmount)}`,
          orderId: order.id
        }
      });
    }

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "cancelled"
      }
    });
  });
}
