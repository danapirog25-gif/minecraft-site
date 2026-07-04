import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Info,
  MessageCircle,
  Music2,
  PackageCheck,
  Radio,
  ShieldCheck,
  ShoppingBag,
  Twitch,
  Youtube
} from "lucide-react";
import { ItemIcon } from "@/components/ItemIcon";
import { creatorInfo } from "@/lib/creator";
import { siteInfo } from "@/lib/site";

const showcaseItems = [
  { label: "Шалкери", iconKind: "shulker_box", className: "left-[6%] top-[8%] h-28 w-28 border-ward/35 bg-ward/10" },
  { label: "Алмази", iconKind: "diamond", className: "right-[12%] top-[4%] h-24 w-24 border-moss/35 bg-moss/10" },
  { label: "Броня", iconKind: "netherite_chestplate", className: "left-[32%] top-[32%] h-36 w-36 border-gold/35 bg-gold/10" },
  { label: "Тотеми", iconKind: "totem_of_undying", className: "right-[2%] top-[40%] h-28 w-28 border-gold/35 bg-gold/10" },
  { label: "Інструменти", iconKind: "diamond_pickaxe", className: "left-[4%] bottom-[8%] h-24 w-24 border-moss/35 bg-moss/10" },
  { label: "Зілля", iconKind: "potion", className: "right-[30%] bottom-[4%] h-24 w-24 border-ward/35 bg-ward/10" }
];

const highlights = [
  {
    title: "Ресурси",
    text: "Алмази, злитки, блоки, їжа, витратники й корисні предмети для швидкого прогресу.",
    iconKind: "diamond",
    accent: "text-moss",
    frame: "hover:border-moss/40 hover:shadow-glow"
  },
  {
    title: "Набори",
    text: "Готові комплекти для старту, будівництва, бою, дослідження й довгого виживання.",
    iconKind: "shulker_box",
    accent: "text-ward",
    frame: "ward-frame"
  },
  {
    title: "Суперпредмети",
    text: "Преміум-речі з адмін-чарами та особливими комбінаціями, які видаються контрольовано.",
    iconKind: "netherite_chestplate",
    accent: "text-gold",
    frame: "legendary-frame shadow-goldglow"
  }
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
    price: "110 талерів",
    iconKind: "shulker_box"
  },
  {
    name: "Бойовий комплект",
    slug: "combat-shulker",
    category: "Бій",
    price: "150 талерів",
    iconKind: "diamond_sword"
  },
  {
    name: "Набір Бога: адмін-чари",
    slug: "full-god-kit",
    category: "Суперпредмети",
    price: "950 талерів",
    iconKind: "netherite_chestplate"
  }
];

const creatorLinks = [
  {
    label: "Twitch",
    handle: "smurfplay4",
    href: creatorInfo.twitchUrl,
    icon: Twitch,
    className: "border-[#9146ff]/40 bg-[#9146ff]/10 text-[#d8b4fe] hover:border-[#c084fc]/70 hover:bg-[#9146ff]/20"
  },
  {
    label: "YouTube",
    handle: "@SmurfPlay2",
    href: creatorInfo.youtubeUrl,
    icon: Youtube,
    className: "border-blood/45 bg-blood/10 text-red-200 hover:border-blood/80 hover:bg-blood/20"
  },
  {
    label: "TikTok",
    handle: "@smurfplay4",
    href: creatorInfo.tiktokUrl,
    icon: Music2,
    className: "border-ward/40 bg-ward/10 text-teal-100 hover:border-ward/80 hover:bg-ward/20"
  }
];

export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[calc(100svh-76px)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(57,255,20,0.12),transparent_26rem),radial-gradient(circle_at_82%_18%,rgba(45,212,191,0.12),transparent_24rem),linear-gradient(180deg,rgba(7,17,10,0.98),rgba(6,10,8,0.96))]" />
        <div className="absolute inset-0 bg-grid-fade bg-[length:72px_72px] opacity-45" />

        <div className="shell relative grid min-h-[calc(100svh-76px)] gap-10 py-14 lg:grid-cols-[1fr_0.86fr] lg:items-center">
          <div className="max-w-4xl pb-10 pt-6">
            <div className="mb-5 inline-flex items-center gap-2 rounded-sm border border-moss/40 bg-moss/10 px-3 py-2 text-sm font-black uppercase tracking-wide text-acid shadow-glow">
              <span className="h-2.5 w-2.5 animate-green-pulse rounded-full bg-acid shadow-[0_0_20px_rgba(57,255,20,0.9)]" />
              Купівля доступна 24/7
            </div>
            <h1 className="voxel-title text-balance text-5xl font-black uppercase leading-none text-white sm:text-6xl lg:text-8xl">
              {siteInfo.name}
            </h1>
            <p className="mt-6 max-w-2xl text-xl font-semibold leading-8 text-fog/80 sm:text-2xl">
              Ресурси, шалкери, набори й окремі предмети для Minecraft-виживання з модами. Поповнюй баланс талерами та купуй усе з одного магазину.
            </p>
            <div className="mt-6 max-w-3xl rounded-sm border border-moss/30 bg-moss/10 px-4 py-3 font-bold leading-7 text-acid">
              Товари можна додати в кошик у будь-який час. Видача проходить після підтвердження адміністратором і відкриття сервера.
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
                href={siteInfo.discordUrl}
                target="_blank"
                rel="noreferrer"
                className="menu-button inline-flex items-center justify-center gap-2 rounded-sm border border-ward/40 bg-ward/10 px-7 py-4 text-base font-black uppercase text-white transition hover:-translate-y-1 hover:bg-ward/20"
              >
                <MessageCircle size={20} />
                Discord
              </a>
            </div>

            <div className="mt-10 grid max-w-3xl gap-3 sm:grid-cols-3">
              {[
                ["24/7", "купівля товарів"],
                ["талери", "оплата з балансу"],
                ["ресурси", "для виживання"]
              ].map(([value, label]) => (
                <div key={label} className="border border-white/10 bg-black/25 px-4 py-3 backdrop-blur">
                  <p className="text-2xl font-black text-acid">{value}</p>
                  <p className="text-sm font-semibold text-fog/60">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[520px] lg:block" aria-hidden="true">
            <div className="absolute inset-10 border border-white/10 bg-black/20 shadow-block" />
            {showcaseItems.map((item) => (
              <div
                key={item.label}
                className={`item-cube absolute grid place-items-center border backdrop-blur ${item.className}`}
              >
                <ItemIcon kind={item.iconKind} size={item.className.includes("h-36") ? "xl" : "lg"} />
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm border border-white/10 bg-black/55 px-2 py-1 text-xs font-black uppercase text-fog/75">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell relative z-10 -mt-10 grid gap-7 pb-16 md:grid-cols-3 lg:-mt-16 lg:pb-20">
        {highlights.map((item) => (
          <article key={item.title} className={`panel shop-card p-7 shadow-block sm:p-8 ${item.frame}`}>
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className={`text-sm font-black uppercase tracking-wide ${item.accent}`}>Каталог</p>
                <h2 className="mt-3 text-3xl font-black text-white">{item.title}</h2>
              </div>
              <div className="item-cube grid h-16 w-16 place-items-center border border-white/10 bg-black/25">
                <ItemIcon kind={item.iconKind} size="md" />
              </div>
            </div>
            <p className="mt-6 max-w-xl text-lg leading-8 text-fog/70">{item.text}</p>
          </article>
        ))}
      </section>

      <section id="smurfplay" className="shell pb-16 pt-4 sm:pb-20 lg:pt-8">
        <div className="pixel-corners relative overflow-hidden border border-ward/30 bg-[linear-gradient(135deg,rgba(45,212,191,0.16),rgba(17,26,19,0.94)_38%,rgba(7,17,10,0.96))] p-8 shadow-glow sm:p-10 lg:p-12">
          <div className="relative grid gap-9 lg:grid-cols-[1fr_0.82fr] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-sm border border-ward/30 bg-ward/10 px-3 py-1.5 text-sm font-black uppercase tracking-wide text-ward">
                <Radio size={16} />
                Контент і стріми
              </p>
              <h2 className="voxel-title mt-5 text-4xl font-black uppercase text-white sm:text-5xl">
                Дивись {creatorInfo.name}
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-fog/72">
                {creatorInfo.name} розвиває сервер, робить стріми та допомагає спільноті збиратися навколо Minecraft-виживання.
                Підписка на його платформи підтримує нові сезони й активність на сервері.
              </p>
              <a
                href={creatorInfo.twitchUrl}
                target="_blank"
                rel="noreferrer"
                className="menu-button mt-8 inline-flex items-center justify-center gap-2 rounded-sm bg-ward px-7 py-4 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid"
              >
                <Twitch size={20} />
                Дивитися стрім
                <ExternalLink size={18} />
              </a>
            </div>

            <div className="grid gap-4">
              {creatorLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`shop-card flex items-center justify-between gap-4 rounded-sm border p-4 transition ${link.className}`}
                  >
                    <span className="flex min-w-0 items-center gap-4">
                      <span className="item-cube grid h-14 w-14 shrink-0 place-items-center border border-current/30 bg-black/25">
                        <Icon size={28} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-lg font-black text-white">{link.label}</span>
                        <span className="block truncate text-sm font-bold text-fog/56">{link.handle}</span>
                      </span>
                    </span>
                    <ExternalLink className="shrink-0 text-fog/50" size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="shell pb-16 pt-8 sm:pb-20 lg:pt-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-moss">Популярні набори</p>
            <h2 className="mt-3 text-4xl font-black text-white">Швидкий старт для виживання</h2>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-2 font-black text-acid transition hover:text-white">
            Увесь магазин
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {popular.map((item) => {
            const isLegendary = item.name.includes("Бога");
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
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.7fr] lg:items-center lg:gap-12">
            <div>
              <p className="inline-flex rounded-sm bg-gold px-3 py-1 text-sm font-black uppercase tracking-wide text-bunker">
                Суперпредмети
              </p>
              <h2 className="voxel-title mt-5 text-4xl font-black uppercase text-white sm:text-5xl">
                Речі богів
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-fog/70">
                Адмін-чари, survival-неможливі комбінації та золоті набори для тих, хто хоче максимально сильний лут.
                Такі предмети видаються вручну й залишаються під контролем адміністрації.
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
              {[
                { label: "LEGENDARY", iconKind: "beacon" },
                { label: "GOD KIT", iconKind: "netherite_chestplate" },
                { label: "POTION", iconKind: "potion" },
                { label: "TOTEMS", iconKind: "totem_of_undying" }
              ].map((item) => (
                <div key={item.label} className="block-surface item-cube border border-gold/25 p-6">
                  <ItemIcon kind={item.iconKind} size="md" />
                  <p className="mt-5 text-xl font-black text-white">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell grid gap-8 pb-24 pt-8 md:grid-cols-3 lg:pb-28 lg:pt-12">
        {[
          { title: "Зручно", text: "Додаєш кілька товарів у кошик і оформлюєш усе одним замовленням.", icon: ShoppingBag },
          { title: "Контроль", text: "Сума й доступність перевіряються на сервері під час покупки.", icon: ShieldCheck },
          { title: "Видача", text: "Адміністратор бачить замовлення й команди видачі в адмін-панелі.", icon: Info }
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
