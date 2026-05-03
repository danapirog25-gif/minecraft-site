import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Skull, UsersRound } from "lucide-react";
import { eventEndConditions, zombieVictoryRewardTalers } from "@/lib/event-info";
import { formatTalers } from "@/lib/currency";

export const metadata: Metadata = {
  title: "Правила | Zombie Event Shop",
  description: "Правила безкоштовного Minecraft-івенту Зомбі проти людей, видачі ресурсів і fair play."
};

const rules = [
  "Вхід на івент безкоштовний.",
  "Купівля ресурсів доступна 24/7.",
  "Видача ресурсів відбувається після старту стріму та відкриття сервера.",
  "Набори купуються добровільно.",
  "Набори не гарантують перемогу.",
  "Адміністрація може обмежити використання занадто сильних предметів, якщо це ламає баланс.",
  eventEndConditions[0],
  eventEndConditions[1],
  `За перемогу зомбі всі активні учасники отримують по ${formatTalers(zombieVictoryRewardTalers)}.`,
  "За перемогу людей талери отримують тільки виживші за таблицею на сторінці івенту.",
  "Заборонено використовувати чіти, баги, дюпи та сторонні програми.",
  "Заборонена токсичність, образи та заважання проведенню івенту.",
  "Ресурси видаються після підтвердження оплати.",
  "Якщо виникла проблема з оплатою — потрібно написати адміністратору."
];

export default function RulesPage() {
  return (
    <section className="shell py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.45fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">Правила івенту</p>
          <h1 className="voxel-title mt-3 text-5xl font-black uppercase text-white">Зомбі проти людей</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-fog/70">
            Режим тримається на чесному темпі: вхід безкоштовний, покупки добровільні, а ресурси
            видаються після підтвердження оплати, старту стріму та відкриття сервера.
          </p>
        </div>
        <div className="panel rounded-sm p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-acid" size={30} />
            <div>
              <p className="font-black text-white">Fair play first</p>
              <p className="text-sm text-fog/60">Баланс важливіший за предмети.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 grid gap-4">
        {rules.map((rule, index) => (
          <div key={rule} className="panel shop-card flex gap-4 rounded-sm p-5 hover:border-moss/40">
            <span className="item-cube grid h-10 w-10 shrink-0 place-items-center border border-moss/30 bg-moss/10 text-sm font-black text-acid">
              {index + 1}
            </span>
            <p className="leading-7 text-fog/75">{rule}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="ward-frame rounded-sm border p-6">
          <UsersRound className="text-ward" size={30} />
          <h2 className="mt-4 text-2xl font-black text-white">Люди</h2>
          <p className="mt-3 leading-7 text-fog/70">
            Тримають базу, ремонтують проходи, ділять ресурси й грають командно до фінального таймера.
          </p>
        </div>
        <div className="danger-frame rounded-sm border p-6">
          <Skull className="text-blood" size={30} />
          <h2 className="mt-4 text-2xl font-black text-white">Зомбі</h2>
          <p className="mt-3 leading-7 text-fog/70">
            Атакують хвилями, шукають слабкі місця й не зловживають spawn-блокуванням.
          </p>
        </div>
      </div>

      <Link
        href="/shop"
        className="menu-button mt-10 inline-flex items-center gap-2 rounded-sm bg-moss px-6 py-4 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid"
      >
        Перейти до магазину
        <ArrowRight size={20} />
      </Link>
    </section>
  );
}
