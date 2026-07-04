import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, HelpCircle, PackageCheck, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import { siteInfo } from "@/lib/site";

export const metadata: Metadata = {
  title: `FAQ | ${siteInfo.name}`,
  description: "Питання про талери, оплату, кошик, видачу ресурсів і покупки в Minecraft-магазині."
};

const questions = [
  {
    icon: CreditCard,
    question: "Як працює оплата?",
    answer: "Спочатку створи заявку на поповнення, оплати точну суму вручну й у коментарі до платежу впиши Minecraft-нік із сайту. Після видачі талерів можна купувати товари з балансу."
  },
  {
    icon: PackageCheck,
    question: "Коли видають ресурси?",
    answer: "Після покупки замовлення потрапляє адміністратору. Видача відбувається вручну після підтвердження покупки та відкриття сервера."
  },
  {
    icon: Wallet,
    question: "Що робити, якщо не вистачає талерів?",
    answer: "Поповни баланс на сторінці талерів. Коли адміністратор підтвердить оплату, валюта зʼявиться в акаунті й стане доступною для покупок."
  },
  {
    icon: RefreshCw,
    question: "Чи можна скасувати покупку?",
    answer: "До видачі адміністратор може скасувати замовлення й повернути талери на баланс. Після видачі товару скасування узгоджується вручну."
  },
  {
    icon: ShieldCheck,
    question: "Чи всі товари доступні для виживання?",
    answer: "Звичайні ресурси й набори підходять для survival-гри. Суперпредмети з адмін-чарами видаються окремо та можуть мати обмеження від адміністрації."
  },
  {
    icon: HelpCircle,
    question: "Це офіційний Minecraft-продукт?",
    answer: "Ні. Проєкт не є офіційним продуктом Minecraft, Mojang або Microsoft і не повʼязаний із ними."
  }
];

export default function FaqPage() {
  return (
    <section className="shell py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">FAQ перед покупкою</p>
          <h1 className="voxel-title mt-3 text-5xl font-black uppercase text-white">Питання без паніки</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-fog/70">
            Короткі відповіді про талери, кошик, видачу ресурсів і підтримку, щоб гравець розумів увесь шлях до покупки.
          </p>
        </div>
        <div className="panel rounded-sm border-moss/30 p-5 shadow-glow">
          <p className="text-sm font-black uppercase text-fog/50">Підтримка</p>
          <a href={`mailto:${siteInfo.supportEmail}`} className="mt-2 block break-all text-xl font-black text-acid transition hover:text-white">
            {siteInfo.supportEmail}
          </a>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {questions.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.question} className="panel shop-card rounded-sm p-6 hover:border-moss/40">
              <Icon className="text-moss" size={28} />
              <h2 className="mt-4 text-2xl font-black text-white">{item.question}</h2>
              <p className="mt-3 leading-7 text-fog/70">{item.answer}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/shop"
          className="menu-button inline-flex items-center justify-center gap-2 rounded-sm bg-moss px-6 py-4 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid"
        >
          До магазину
          <ArrowRight size={18} />
        </Link>
        <Link
          href="/top-up"
          className="menu-button inline-flex items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/10 px-6 py-4 font-black uppercase text-white transition hover:-translate-y-1 hover:bg-white/20"
        >
          Поповнити баланс
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
