import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, CreditCard, ShieldCheck } from "lucide-react";
import { ItemIcon } from "@/components/ItemIcon";
import { formatHryvnias, formatTalers } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/user-auth";
import { TopUpPanel } from "./TopUpPanel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Купити талери | Zombie Event Shop",
  description: "Поповнення балансу талерів через monobank для покупок у Minecraft-магазині івенту."
};

const statusLabels: Record<string, string> = {
  pending: "Очікує оплату",
  paid: "Зараховано",
  failed: "Помилка оплати"
};

const statusClasses: Record<string, string> = {
  pending: "border-lava/30 bg-lava/10 text-orange-100",
  paid: "border-moss/30 bg-moss/10 text-acid",
  failed: "border-blood/30 bg-blood/10 text-red-100"
};

export default async function TopUpPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/top-up");
  }

  const topUps = await prisma.currencyTopUp.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return (
    <section className="shell py-16 sm:py-20">
      <div className="mb-8 grid gap-8 lg:grid-cols-[1fr_0.42fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">Поповнення балансу</p>
          <h1 className="voxel-title mt-3 text-4xl font-black uppercase text-white">Купити талери</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-fog/70">
            Талери — внутрішня валюта магазину. Спочатку поповни баланс через monobank, а потім купуй набори, ресурси й суперпредмети без окремих оплат за кожен товар.
          </p>
        </div>
        <div className="panel rounded-sm border-gold/30 p-5 shadow-goldglow">
          <div className="flex items-start gap-4">
            <div className="item-cube grid h-14 w-14 place-items-center border border-gold/35 bg-gold/10">
              <ItemIcon kind="gold_ingot" size="md" />
            </div>
            <div>
              <p className="text-sm font-black uppercase text-fog/55">Поточний баланс</p>
              <p className="mt-2 text-3xl font-black text-gold">{formatTalers(user.balance)}</p>
            </div>
          </div>
        </div>
      </div>

      <TopUpPanel />

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="panel rounded-sm p-5">
          <CreditCard className="text-moss" size={26} />
          <h2 className="mt-4 text-xl font-black text-white">Оплата через monobank</h2>
          <p className="mt-3 leading-7 text-fog/65">Після успішної оплати талери автоматично додаються на баланс акаунта.</p>
        </div>
        <div className="panel rounded-sm p-5">
          <ShieldCheck className="text-gold" size={26} />
          <h2 className="mt-4 text-xl font-black text-white">Ручна видача адміном</h2>
          <p className="mt-3 leading-7 text-fog/65">Адміністратор може додати або списати талери через адмін-панель.</p>
        </div>
        <div className="panel rounded-sm p-5">
          <Clock className="text-ward" size={26} />
          <h2 className="mt-4 text-xl font-black text-white">Покупки 24/7</h2>
          <p className="mt-3 leading-7 text-fog/65">Усі придбані товари будуть видані після старту стріму та відкриття сервера.</p>
        </div>
      </div>

      <section className="mt-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-moss">Історія</p>
            <h2 className="mt-2 text-3xl font-black text-white">Останні поповнення</h2>
          </div>
          <Link href="/account" className="font-black text-acid transition hover:text-white">
            До кабінету
          </Link>
        </div>

        {topUps.length ? (
          <div className="grid gap-4">
            {topUps.map((topUp) => (
              <article key={topUp.id} className="panel rounded-sm p-5">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <span className={`rounded-sm border px-2.5 py-1 text-xs font-black uppercase ${statusClasses[topUp.status] ?? statusClasses.pending}`}>
                      {statusLabels[topUp.status] ?? topUp.status}
                    </span>
                    <p className="mt-3 text-xl font-black text-white">{formatTalers(topUp.amountTalers)}</p>
                    <p className="mt-1 text-sm text-fog/55">{new Date(topUp.createdAt).toLocaleString("uk-UA")}</p>
                  </div>
                  <p className="text-2xl font-black text-gold">{formatHryvnias(topUp.amountKopiyky)}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="panel rounded-sm p-6 text-fog/60">Поповнень ще немає.</div>
        )}
      </section>
    </section>
  );
}
