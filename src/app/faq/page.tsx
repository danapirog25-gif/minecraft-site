import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, HelpCircle, PackageCheck, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import { eventInfo, killRewardTalers, zombieVictoryRewardTalers } from "@/lib/event-info";
import { formatTalers } from "@/lib/currency";

export const metadata: Metadata = {
  title: "FAQ | Zombie Event Shop",
  description: "Питання про талери, оплату, видачу ресурсів, повернення й правила Minecraft-івенту."
};

const questions = [
  {
    icon: CreditCard,
    question: "Як працює оплата?",
    answer: "Спочатку ви поповнюєте баланс талерів через monobank, а потім купуєте товари з балансу без окремої гривневої оплати за кожен набір."
  },
  {
    icon: PackageCheck,
    question: "Коли видають ресурси?",
    answer: "Покупки доступні 24/7, але видача відбувається після старту стріму та відкриття сервера, щоб адміністратор міг проконтролювати баланс і команди."
  },
  {
    icon: Wallet,
    question: "Що робити, якщо не вистачає талерів?",
    answer: "Поповніть баланс на сторінці талерів або зверніться до адміністратора, якщо талери мають бути додані вручну."
  },
  {
    icon: RefreshCw,
    question: "Чи можна скасувати покупку?",
    answer: "До видачі адміністратор може скасувати замовлення й повернути талери на баланс. Після видачі замовлення не скасовується автоматично."
  },
  {
    icon: ShieldCheck,
    question: "Чи гарантують набори перемогу?",
    answer: "Ні. Набори допомагають підготуватися до івенту, але правила, командна гра й баланс важливіші за будь-який предмет."
  },
  {
    icon: Wallet,
    question: "Коли закінчується івент і хто отримує талери?",
    answer: `Івент завершується, коли зомбі перемагають або люди прожили 100 Minecraft-днів. За перемогу зомбі всі активні учасники отримують по ${formatTalers(zombieVictoryRewardTalers)}, а за перемогу людей виплати йдуть тільки вижившим за таблицею на сторінці івенту.`
  },
  {
    icon: Wallet,
    question: "Чи дають талери за вбивства?",
    answer: `Так. За кожне підтверджене вбивство додається +${formatTalers(killRewardTalers)}. Після завершення івенту адміністрація підраховує вбивства й видає бонус на баланс акаунта, якщо гравець зареєстрований на сайті.`
  },
  {
    icon: HelpCircle,
    question: "Це офіційний Minecraft-продукт?",
    answer: "Ні. Проєкт не є офіційним продуктом Minecraft, Mojang або Microsoft і не повʼязаний з ними."
  }
];

export default function FaqPage() {
  return (
    <section className="shell py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.4fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">FAQ перед оплатою</p>
          <h1 className="voxel-title mt-3 text-5xl font-black uppercase text-white">Питання без паніки</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-fog/70">
            Короткі відповіді про талери, кошик, видачу ресурсів і правила, щоб гравець розумів увесь шлях до покупки.
          </p>
        </div>
        <div className="panel rounded-sm border-moss/30 p-5 shadow-glow">
          <p className="text-sm font-black uppercase text-fog/50">Підтримка</p>
          <a href={`mailto:${eventInfo.supportEmail}`} className="mt-2 block break-all text-xl font-black text-acid transition hover:text-white">
            {eventInfo.supportEmail}
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
          href="/event"
          className="menu-button inline-flex items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/10 px-6 py-4 font-black uppercase text-white transition hover:-translate-y-1 hover:bg-white/20"
        >
          Статус івенту
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
