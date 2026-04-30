import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  MessageCircle,
  Radio,
  Send,
  Server,
  ShieldCheck,
  ShoppingCart,
  Skull,
  Timer,
  Trophy,
  UsersRound,
  Wallet
} from "lucide-react";
import {
  eventEndConditions,
  eventInfo,
  getEventStartIso,
  humanVictoryRewards,
  killRewardTalers,
  zombieVictoryRewardTalers
} from "@/lib/event-info";
import { formatTalers } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import { EventCountdown } from "./EventCountdown";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Івент наживо | Zombie Event Shop",
  description: "Статус стріму, сервера, видачі ресурсів і корисні посилання для Minecraft-івенту Зомбі проти людей."
};

function survivorLabel(count: number) {
  if (count === 1) {
    return "1 людина";
  }

  if (count >= 2 && count <= 4) {
    return `${count} людини`;
  }

  return `${count} людей`;
}

export default async function EventPage() {
  const [settings, pendingOrders, issuedOrders, activeProducts] = await Promise.all([
    getStoreSettings(),
    prisma.order.count({ where: { status: { in: ["pending", "paid"] } } }),
    prisma.order.count({ where: { status: "issued" } }),
    prisma.product.count({ where: { isActive: true } })
  ]);

  const startAtIso = getEventStartIso();

  return (
    <section>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/zombie-event-hero.png"
            alt="Нічний Minecraft-івент із людьми та зомбі"
            fill
            priority
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bunker via-bunker/82 to-bunker/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-bunker via-transparent to-black/50" />
        </div>

        <div className="shell relative grid min-h-[520px] gap-8 py-16 lg:grid-cols-[1fr_0.46fr] lg:items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-sm border border-moss/40 bg-moss/10 px-3 py-2 text-sm font-black uppercase tracking-wide text-acid shadow-glow">
              <span className={`h-2.5 w-2.5 rounded-full ${settings.streamActive ? "animate-green-pulse bg-acid" : "bg-lava"}`} />
              {settings.streamActive ? "Стрім активний" : "Очікуємо старт"}
            </p>
            <h1 className="voxel-title mt-5 text-5xl font-black uppercase leading-tight text-white sm:text-6xl">
              Івент наживо
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-fog/76">
              Тут зібрані статус стріму, сервер, спільнота й готовність видачі. Покупки працюють 24/7, а ресурси видаються після старту стріму та відкриття сервера.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="menu-button inline-flex items-center justify-center gap-2 rounded-sm bg-moss px-6 py-4 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid"
              >
                <ShoppingCart size={19} />
                До магазину
              </Link>
              <a
                href={eventInfo.streamUrl}
                target="_blank"
                rel="noreferrer"
                className="menu-button inline-flex items-center justify-center gap-2 rounded-sm border border-blood/40 bg-blood/10 px-6 py-4 font-black uppercase text-white transition hover:-translate-y-1 hover:bg-blood/20"
              >
                <Radio size={19} />
                Стрім
              </a>
            </div>
          </div>

          <EventCountdown startAtIso={startAtIso} />
        </div>
      </div>

      <div className="shell py-14">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <div className={`rounded-sm border p-5 ${settings.streamActive ? "border-moss/35 bg-moss/10" : "border-lava/35 bg-lava/10"}`}>
            <Radio className={settings.streamActive ? "text-acid" : "text-lava"} size={28} />
            <h2 className="mt-4 text-xl font-black text-white">Статус стріму</h2>
            <p className="mt-2 text-fog/65">{settings.streamActive ? "Видача відкрита" : "Видача очікує старту"}</p>
          </div>
          <div className="panel rounded-sm p-5">
            <Server className="text-ward" size={28} />
            <h2 className="mt-4 text-xl font-black text-white">Сервер</h2>
            <p className="mt-2 break-all text-fog/65">{eventInfo.serverAddress}</p>
          </div>
          <div className="panel rounded-sm p-5">
            <Wallet className="text-gold" size={28} />
            <h2 className="mt-4 text-xl font-black text-white">Очікують видачі</h2>
            <p className="mt-2 text-3xl font-black text-gold">{pendingOrders}</p>
          </div>
          <div className="panel rounded-sm p-5">
            <ShieldCheck className="text-moss" size={28} />
            <h2 className="mt-4 text-xl font-black text-white">Активних товарів</h2>
            <p className="mt-2 text-3xl font-black text-acid">{activeProducts}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <section className="panel rounded-sm p-6">
            <p className="text-sm font-black uppercase tracking-wide text-moss">Фініш івенту</p>
            <h2 className="mt-3 text-3xl font-black text-white">Коли завершується матч</h2>
            <div className="mt-6 grid gap-3">
              {eventEndConditions.map((condition, index) => {
                const Icon = index === 0 ? Skull : Timer;

                return (
                  <div key={condition} className="flex gap-3 rounded-sm border border-white/10 bg-black/20 p-4">
                    <Icon className={index === 0 ? "mt-1 shrink-0 text-blood" : "mt-1 shrink-0 text-ward"} size={22} />
                    <p className="leading-7 text-fog/72">{condition}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="panel rounded-sm p-6">
            <p className="text-sm font-black uppercase tracking-wide text-gold">Нагороди талерами</p>
            <h2 className="mt-3 text-3xl font-black text-white">Виплати після перемоги</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-sm border border-blood/35 bg-blood/10 p-4">
                <Skull className="text-blood" size={24} />
                <p className="mt-3 font-black text-white">Перемагають зомбі</p>
                <p className="mt-2 leading-7 text-fog/70">
                  Усі активні учасники отримують по{" "}
                  <span className="font-black text-gold">{formatTalers(zombieVictoryRewardTalers)}</span>.
                </p>
              </div>
              <div className="rounded-sm border border-ward/35 bg-ward/10 p-4">
                <Trophy className="text-ward" size={24} />
                <p className="mt-3 font-black text-white">Перемагають люди</p>
                <p className="mt-2 leading-7 text-fog/70">
                  Талери отримують тільки виживші. Чим менше виживших, тим більша нагорода кожному.
                </p>
              </div>
              <div className="rounded-sm border border-gold/35 bg-gold/10 p-4 sm:col-span-2 xl:col-span-1">
                <Coins className="text-gold" size={24} />
                <p className="mt-3 font-black text-white">Бонус за вбивства</p>
                <p className="mt-2 leading-7 text-fog/70">
                  За кожне підтверджене вбивство додається{" "}
                  <span className="font-black text-gold">+{formatTalers(killRewardTalers)}</span>. Після івенту
                  адміністрація підраховує вбивства й видає талери на баланс акаунта, якщо гравець зареєстрований на сайті.
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {humanVictoryRewards.map((item) => (
                <div key={item.survivors} className="flex items-center justify-between gap-3 rounded-sm border border-white/10 bg-black/20 px-3 py-2">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-fog/70">
                    <UsersRound size={15} className="text-ward" />
                    {survivorLabel(item.survivors)}
                  </span>
                  <span className="inline-flex items-center gap-1 font-black text-gold">
                    <Coins size={15} />
                    {formatTalers(item.reward)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="panel rounded-sm p-6">
            <p className="text-sm font-black uppercase tracking-wide text-moss">Перед стартом</p>
            <h2 className="mt-3 text-3xl font-black text-white">Швидка перевірка</h2>
            <div className="mt-6 grid gap-3">
              {[
                "Увійдіть в акаунт і перевірте Minecraft-нік",
                "Поповніть баланс талерів, якщо плануєте купувати кілька наборів",
                "Залиште актуальний Telegram або Discord у checkout",
                "Після старту стріму дочекайтеся видачі адміністратором"
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-sm border border-white/10 bg-black/20 p-4">
                  <span className="mt-2 h-2 w-2 shrink-0 bg-acid" />
                  <p className="leading-7 text-fog/72">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel rounded-sm p-6">
            <p className="text-sm font-black uppercase tracking-wide text-moss">Спільнота</p>
            <h2 className="mt-3 text-3xl font-black text-white">Куди писати</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a
                href={eventInfo.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="shop-card rounded-sm border border-white/10 bg-white/5 p-5 hover:border-moss/40"
              >
                <MessageCircle className="text-moss" size={26} />
                <p className="mt-3 font-black text-white">Discord</p>
                <p className="mt-2 text-sm text-fog/60">Питання по видачі й команді.</p>
              </a>
              <a
                href={eventInfo.telegramUrl}
                target="_blank"
                rel="noreferrer"
                className="shop-card rounded-sm border border-white/10 bg-white/5 p-5 hover:border-ward/40"
              >
                <Send className="text-ward" size={26} />
                <p className="mt-3 font-black text-white">Telegram</p>
                <p className="mt-2 text-sm text-fog/60">Швидкий контакт з адміном.</p>
              </a>
            </div>
            <Link href="/faq" className="mt-6 inline-flex items-center gap-2 font-black text-acid transition hover:text-white">
              Відкрити FAQ
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>

        <div className="mt-10 rounded-sm border border-white/10 bg-white/5 p-5">
          <p className="text-sm font-black uppercase text-fog/50">Видано замовлень</p>
          <p className="mt-2 text-3xl font-black text-acid">{issuedOrders}</p>
        </div>
      </div>
    </section>
  );
}
