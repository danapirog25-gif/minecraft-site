import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Info,
  MessageCircle,
  Shield,
  ShoppingCart,
  Skull,
  UserRound
} from "lucide-react";
import { ItemIcon } from "@/components/ItemIcon";

const sides = [
  {
    title: "Люди",
    eyebrow: "Base defense",
    text: "Будують укріплення, ділять ресурси, тримають ворота й доживають до фінального таймера.",
    icon: Shield,
    accentText: "text-ward",
    accentBorder: "border-ward/30",
    accentBg: "bg-ward/10",
    className: "ward-frame"
  },
  {
    title: "Зомбі",
    eyebrow: "Infection wave",
    text: "Тиснуть хвилями, шукають слабкі місця в базі й перетворюють необережних гравців на союзників.",
    icon: Skull,
    accentText: "text-blood",
    accentBorder: "border-blood/30",
    accentBg: "bg-blood/10",
    className: "danger-frame"
  }
];

const flow = [
  { title: "Поповнюєш баланс", text: "Створюєш заявку, оплачуєш вручну й пишеш нік у коментарі.", icon: CreditCard },
  { title: "Обираєш товар", text: "Старт, шалкер, суперпредмет або ресурс.", icon: ShoppingCart },
  { title: "Підтверджуєш нік", text: "Замовлення привʼязується до Minecraft-ніка в акаунті.", icon: UserRound },
  { title: "Отримуєш на стрімі", text: "Видача після старту стріму та відкриття сервера.", icon: BadgeCheck }
];

const popular = [
  {
    name: "Старт виживальника",
    slug: "survivor-start",
    category: "Базовий набір",
    price: "70 талерів",
    iconKind: "iron_chestplate"
  },
  {
    name: "Комплект виживання",
    slug: "survival-shulker",
    category: "Виживання",
    price: "120 талерів",
    iconKind: "shulker_box"
  },
  {
    name: "Бойовий комплект",
    slug: "combat-shulker",
    category: "Бій",
    price: "160 талерів",
    iconKind: "diamond_sword"
  },
  {
    name: "Набір Бога: адмін-чари",
    slug: "full-god-kit",
    category: "Суперпредмети",
    price: "500 талерів",
    iconKind: "netherite_chestplate"
  }
];

export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[calc(100svh-76px)] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/zombie-event-hero.png"
            alt="Нічний кубічний світ із силуетами людей, зомбі та червоним сигналом небезпеки"
            fill
            priority
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bunker via-bunker/80 to-bunker/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-bunker via-transparent to-black/40" />
          <div className="absolute inset-0 bg-grid-fade bg-[length:72px_72px] opacity-35" />
        </div>

        <div className="pointer-events-none absolute right-[8%] top-[16%] hidden h-16 w-16 animate-slow-float border border-moss/30 bg-moss/20 shadow-glow sm:block" />
        <div className="pointer-events-none absolute bottom-[18%] right-[18%] hidden h-20 w-12 border border-blood/30 bg-blood/20 shadow-redglow lg:block" />
        <div className="pointer-events-none absolute bottom-[14%] left-[9%] hidden h-12 w-28 border border-gold/30 bg-gold/10 shadow-goldglow md:block" />

        <div className="shell relative flex min-h-[calc(100svh-76px)] items-center py-14">
          <div className="max-w-4xl pb-16 pt-6">
            <div className="mb-5 inline-flex items-center gap-2 rounded-sm border border-moss/40 bg-moss/10 px-3 py-2 text-sm font-black uppercase tracking-wide text-acid shadow-glow">
              <span className="h-2.5 w-2.5 animate-green-pulse rounded-full bg-acid shadow-[0_0_20px_rgba(57,255,20,0.9)]" />
              Купівля доступна 24/7
            </div>
            <h1 className="voxel-title text-balance text-5xl font-black uppercase leading-none text-white sm:text-6xl lg:text-8xl">
              Zombie Event Shop
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-fog/80 sm:text-2xl">
              Minecraft-крамниця для івенту: набори, шалкери й ресурси для стріму “Зомбі проти людей”.
              Поповнюй баланс талерами й купуй товари без окремої гривневої оплати за кожен набір.
            </p>
            <div className="mt-6 max-w-3xl rounded-sm border border-moss/30 bg-moss/10 px-4 py-3 font-bold leading-7 text-acid">
              Ресурси можна придбати у будь-який час. Матч завершується перемогою зомбі або якщо люди прожили 100 Minecraft-днів.
            </div>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="menu-button inline-flex items-center justify-center gap-2 rounded-sm bg-moss px-7 py-4 text-base font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid"
              >
                Перейти до магазину
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/top-up"
                className="menu-button inline-flex items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/10 px-7 py-4 text-base font-black uppercase text-white transition hover:-translate-y-1 hover:bg-white/20"
              >
                Поповнити баланс
              </Link>
              <a
                href="https://discord.gg/"
                target="_blank"
                rel="noreferrer"
                className="menu-button inline-flex items-center justify-center gap-2 rounded-sm border border-blood/40 bg-blood/10 px-7 py-4 text-base font-black uppercase text-white transition hover:-translate-y-1 hover:bg-blood/20"
              >
                <MessageCircle size={20} />
                Discord
              </a>
            </div>

            <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                ["5", "категорій товарів"],
                ["0 грн", "вхід на івент"],
                ["24/7", "купівля ресурсів"]
              ].map(([value, label]) => (
                <div key={label} className="border border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
                  <p className="text-2xl font-black text-acid">{value}</p>
                  <p className="text-sm font-semibold text-fog/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell relative z-10 -mt-16 grid gap-8 pb-16 md:grid-cols-2 lg:-mt-20 lg:gap-10 lg:pb-20">
        {sides.map((side) => {
          const Icon = side.icon;
          return (
            <article key={side.title} className={`panel pixel-corners shop-card p-7 shadow-block sm:p-8 ${side.className}`}>
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className={`text-sm font-black uppercase tracking-wide ${side.accentText}`}>{side.eyebrow}</p>
                  <h2 className="mt-3 text-3xl font-black text-white">{side.title}</h2>
                </div>
                <div className={`item-cube grid h-16 w-16 place-items-center border ${side.accentBorder} ${side.accentBg}`}>
                  <Icon className={side.accentText} size={34} />
                </div>
              </div>
              <p className="mt-6 max-w-xl text-lg leading-8 text-fog/70">{side.text}</p>
            </article>
          );
        })}
      </section>

      <section className="shell pb-16 pt-4 sm:pb-20 lg:pt-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-moss">Як це працює</p>
            <h2 className="mt-3 text-4xl font-black text-white">4 кроки до івенту</h2>
          </div>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {flow.map((step, index) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="panel shop-card rounded-sm p-6 hover:border-moss/40 hover:shadow-glow">
                <div className="flex items-center justify-between">
                  <Icon className="text-moss" size={28} />
                  <span className="font-display text-2xl text-fog/20">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-black text-white">{step.title}</h3>
                <p className="mt-3 leading-7 text-fog/60">{step.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="shell pb-16 pt-8 sm:pb-20 lg:pt-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-moss">Популярні набори</p>
            <h2 className="mt-3 text-4xl font-black text-white">Швидкий старт для матчу</h2>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-2 font-black text-acid transition hover:text-white">
            Увесь магазин
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {popular.map((item) => {
            const isLegendary = item.category === "LEGENDARY" || item.name.includes("Бога");
            return (
              <Link
                key={item.slug}
                href={`/shop/${item.slug}`}
                className={`panel shop-card flex min-h-80 flex-col rounded-sm p-6 ${
                  isLegendary ? "legendary-frame shadow-goldglow" : "hover:border-moss/40 hover:shadow-glow"
                }`}
              >
                <div className="flex items-start justify-between gap-5">
                  <div className="item-cube grid h-20 w-20 place-items-center border border-white/10 bg-black/25">
                    <ItemIcon kind={item.iconKind} size="lg" />
                  </div>
                  <span className={`rounded-sm px-2.5 py-1 text-xs font-black uppercase ${isLegendary ? "bg-gold text-bunker" : "bg-moss/10 text-moss"}`}>
                    {item.category}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-black text-white">{item.name}</h3>
                <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-fog/48">{item.price}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-6 font-black text-acid">
                  Переглянути
                  <ArrowRight size={17} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="shell pb-16 pt-8 sm:pb-20 lg:pt-12">
        <div className="legendary-frame pixel-corners relative overflow-hidden border p-8 shadow-goldglow sm:p-12 lg:p-14">
          <div className="absolute right-8 top-8 hidden h-24 w-24 animate-gold-pulse border border-gold/50 bg-gold/10 lg:block" />
          <div className="absolute bottom-8 right-36 hidden h-14 w-28 border border-lava/30 bg-lava/10 lg:block" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-center lg:gap-12">
            <div>
              <p className="inline-flex rounded-sm bg-gold px-3 py-1 text-sm font-black uppercase tracking-wide text-bunker">
                Суперпредмети
              </p>
              <h2 className="voxel-title mt-5 text-4xl font-black uppercase text-white sm:text-5xl">
                Речі богів
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-fog/70">
                Адмін-чари, survival-неможливі комбінації й золоті набори для особливих раундів.
                Виглядають як бос-лут, видаються контрольовано й не показують гравцю технічні команди.
              </p>
              <Link
                href="/shop#gods"
                className="menu-button mt-8 inline-flex items-center justify-center gap-2 rounded-sm bg-gold px-7 py-4 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-yellow-300"
              >
                Переглянути преміум
                <ArrowRight size={19} />
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {["LEGENDARY", "GOD KIT", "POTION", "TOTEMS"].map((label) => (
                <div key={label} className="block-surface item-cube border border-gold/25 p-6">
                  <ItemIcon
                    kind={
                      label === "TOTEMS"
                        ? "totem_of_undying"
                        : label === "POTION"
                          ? "potion"
                          : label === "GOD KIT"
                            ? "netherite_chestplate"
                            : "beacon"
                    }
                    size="md"
                  />
                  <p className="mt-5 text-xl font-black text-white">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell grid gap-8 pb-24 pt-8 md:grid-cols-3 lg:pb-28 lg:pt-12">
        {[
          { title: "Виживання", text: "Темний нічний світ, оборона бази й хвилі зараження.", icon: Shield },
          { title: "Баланс", text: "Преміум-набори виглядають дорого, але лишаються під контролем адміністрації.", icon: Shield },
          { title: "Видача", text: "Купуєш 24/7, а ресурси отримуєш після старту стріму.", icon: Info }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="panel rounded-sm p-7">
              <Icon className="text-moss" size={30} />
              <h2 className="mt-5 text-2xl font-black text-white">{item.title}</h2>
              <p className="mt-3 leading-7 text-fog/60">{item.text}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
