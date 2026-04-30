import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, PackageOpen, ShieldCheck, UserRound, Wallet } from "lucide-react";
import { ItemIcon } from "@/components/ItemIcon";
import { LogoutButton } from "@/components/LogoutButton";
import { parseOrderProducts } from "@/lib/catalog";
import { formatTalers } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import { getCurrentUser } from "@/lib/user-auth";

const statusClasses: Record<string, string> = {
  pending: "border-lava/30 bg-lava/10 text-orange-100",
  paid: "border-moss/30 bg-moss/10 text-acid",
  issued: "border-ward/30 bg-ward/10 text-ward",
  cancelled: "border-blood/30 bg-blood/10 text-red-100",
  failed: "border-blood/30 bg-blood/10 text-red-100"
};

const orderSteps = ["Куплено", "Очікує старту", "Готово до видачі", "Видано"];

function getOrderView(status: string, streamActive: boolean) {
  if (status === "issued") {
    return {
      label: "Видано",
      className: statusClasses.issued,
      step: 4,
      note: "Замовлення вже позначене як видане адміністратором."
    };
  }

  if (status === "cancelled") {
    return {
      label: "Скасовано",
      className: statusClasses.cancelled,
      step: 0,
      note: "Замовлення скасовано. Якщо воно було оплачено талерами, повернення видно в історії балансу."
    };
  }

  if (status === "failed") {
    return {
      label: "Помилка оплати",
      className: statusClasses.failed,
      step: 0,
      note: "Оплата не завершилась. За потреби напишіть адміністратору."
    };
  }

  if (streamActive) {
    return {
      label: "Готово до видачі",
      className: "border-moss/30 bg-moss/10 text-acid",
      step: 3,
      note: "Стрім активний, тож адміністратор може видати ресурси."
    };
  }

  return {
    label: "Очікує старту",
    className: "border-lava/30 bg-lava/10 text-orange-100",
    step: 2,
    note: "Покупка збережена. Видача відкриється після старту стріму та сервера."
  };
}

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Мій акаунт | Zombie Event Shop",
  description: "Баланс талерів, історія покупок і статус видачі ресурсів для Minecraft-івенту."
};

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const [orders, transactions, settings] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30
    }),
    prisma.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8
    }),
    getStoreSettings()
  ]);

  return (
    <section className="shell py-16 sm:py-20">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">Особистий кабінет</p>
          <h1 className="voxel-title mt-3 text-4xl font-black uppercase text-white">Мій акаунт</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-fog/70">
            Тут зберігаються твої дані для покупок, баланс талерів і історія замовлень.
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        <aside className="panel h-fit rounded-sm p-6 shadow-glow">
          <div className="flex items-start gap-4">
            <div className="item-cube grid h-14 w-14 shrink-0 place-items-center border border-moss/35 bg-moss/10">
              <UserRound className="text-acid" size={28} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-moss">Гравець</p>
              <h2 className="mt-2 text-2xl font-black text-white">{user.minecraftNickname}</h2>
              <p className="mt-1 text-sm text-fog/60">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            <div className="block-surface rounded-sm border border-white/10 p-4">
              <p className="text-xs font-black uppercase text-fog/50">Контакт</p>
              <p className="mt-2 font-bold text-white">{user.contact || "Не вказано"}</p>
            </div>
            <div className="block-surface rounded-sm border border-white/10 p-4">
              <p className="text-xs font-black uppercase text-fog/50">Баланс</p>
              <div className="mt-2 flex items-center gap-3">
                <ItemIcon kind="gold_ingot" size="xs" />
                <p className="text-2xl font-black text-gold">{formatTalers(user.balance)}</p>
              </div>
              <Link href="/top-up" className="mt-4 inline-flex items-center gap-2 font-black text-acid transition hover:text-white">
                <Wallet size={16} />
                Поповнити баланс
              </Link>
            </div>
            <div className="block-surface rounded-sm border border-white/10 p-4">
              <p className="text-xs font-black uppercase text-fog/50">Замовлень</p>
              <p className="mt-2 text-2xl font-black text-acid">{orders.length}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <p className="text-sm font-black uppercase tracking-wide text-moss">Рух талерів</p>
            <div className="mt-4 grid gap-3">
              {transactions.length ? (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-sm border border-white/10 bg-black/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-white">{transaction.description}</p>
                      <span className={transaction.amount >= 0 ? "font-black text-acid" : "font-black text-red-100"}>
                        {transaction.amount >= 0 ? "+" : "-"}
                        {formatTalers(Math.abs(transaction.amount))}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-fog/45">{new Date(transaction.createdAt).toLocaleString("uk-UA")}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-fog/55">Руху валюти ще немає.</p>
              )}
            </div>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-moss">Покупки</p>
              <h2 className="mt-2 text-3xl font-black text-white">Історія замовлень</h2>
            </div>
            <Link className="font-black text-acid transition hover:text-white" href="/shop">
              До магазину
            </Link>
          </div>

          {orders.length ? (
            <div className="grid gap-4">
              {orders.map((order) => {
                const products = parseOrderProducts(order.products);
                const view = getOrderView(order.status, settings.streamActive);

                return (
                  <article key={order.id} className="panel rounded-sm p-5">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-sm border px-2.5 py-1 text-xs font-black uppercase ${view.className}`}>
                            {view.label}
                          </span>
                          <span className="inline-flex items-center gap-2 text-sm text-fog/55">
                            <CalendarDays size={15} />
                            {new Intl.DateTimeFormat("uk-UA", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            }).format(order.createdAt)}
                          </span>
                        </div>
                        <h3 className="mt-4 text-xl font-black text-white">
                          {products.map((product) => product.name).join(", ") || "Замовлення"}
                        </h3>
                        <p className="mt-2 text-sm text-fog/60">Нік: {order.playerNickname}</p>
                        <p className="mt-3 text-sm leading-6 text-fog/62">{view.note}</p>
                      </div>
                      <p className="text-2xl font-black text-acid">{formatTalers(order.totalAmount)}</p>
                    </div>
                    {view.step > 0 ? (
                      <div className="mt-5 grid gap-2 sm:grid-cols-4">
                        {orderSteps.map((step, index) => {
                          const isActive = index + 1 <= view.step;
                          const isCurrent = index + 1 === view.step;

                          return (
                            <div
                              key={step}
                              className={`rounded-sm border px-3 py-2 text-xs font-black uppercase ${
                                isActive
                                  ? isCurrent
                                    ? "border-moss/35 bg-moss/10 text-acid"
                                    : "border-ward/25 bg-ward/10 text-ward"
                                  : "border-white/10 bg-white/5 text-fog/35"
                              }`}
                            >
                              {step}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="panel rounded-sm p-8 text-center">
              <PackageOpen className="mx-auto text-moss" size={42} />
              <h3 className="mt-4 text-2xl font-black text-white">Замовлень ще немає</h3>
              <p className="mt-3 text-fog/60">Після покупки тут зʼявиться статус і список товарів.</p>
              <Link
                href="/shop"
                className="menu-button mt-6 inline-flex items-center gap-2 rounded-sm bg-moss px-6 py-3 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid"
              >
                <ShieldCheck size={18} />
                Перейти в магазин
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
