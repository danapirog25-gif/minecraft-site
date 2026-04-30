import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  PackageOpen,
  Info
} from "lucide-react";
import { CartButton } from "@/components/CartButton";
import { ItemIcon, itemKindFromProduct } from "@/components/ItemIcon";
import { prisma } from "@/lib/prisma";
import { categoryLabels, parseTextList, teamLabels } from "@/lib/catalog";
import { formatTalers } from "@/lib/currency";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

const categoryVisuals: Record<
  string,
  {
    frame: string;
    badge: string;
    price: string;
    cta: string;
  }
> = {
  starter: {
    frame: "hover:border-moss/40",
    badge: "border-moss/25 bg-moss/10 text-moss",
    price: "text-acid",
    cta: "bg-moss text-bunker hover:bg-acid"
  },
  survival_shulkers: {
    frame: "ward-frame",
    badge: "border-ward/25 bg-ward/10 text-ward",
    price: "text-ward",
    cta: "bg-ward text-bunker hover:bg-cyan-200"
  },
  combat_shulkers: {
    frame: "danger-frame",
    badge: "border-blood/30 bg-blood/10 text-red-100",
    price: "text-lava",
    cta: "bg-blood text-white hover:bg-red-400"
  },
  gods: {
    frame: "legendary-frame shadow-goldglow",
    badge: "border-gold/60 bg-gold text-bunker",
    price: "text-gold",
    cta: "bg-gold text-bunker hover:bg-yellow-300"
  },
  single_resources: {
    frame: "hover:border-ward/40",
    badge: "border-ward/25 bg-ward/10 text-ward",
    price: "text-ward",
    cta: "bg-moss text-bunker hover:bg-acid"
  },
  event_perks: {
    frame: "legendary-frame shadow-goldglow",
    badge: "border-gold/50 bg-gold/10 text-gold",
    price: "text-gold",
    cta: "bg-gold text-bunker hover:bg-yellow-300"
  }
};

function getVisual(category: string) {
  return categoryVisuals[category] ?? categoryVisuals.starter;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug, isActive: true },
    select: { name: true, description: true }
  });

  if (!product) {
    return {
      title: "Набір не знайдено"
    };
  }

  return {
    title: `${product.name} | Zombie Event Shop`,
    description: product.description
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await prisma.product.findFirst({
    where: {
      slug: params.slug,
      isActive: true
    }
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      category: product.category,
      isActive: true,
      NOT: { id: product.id }
    },
    orderBy: { price: "asc" },
    take: 3
  });

  const contents = parseTextList(product.contents);
  const benefits = parseTextList(product.benefits);
  const visual = getVisual(product.category);
  const isLegendary = product.category === "gods";
  const isResource = product.category === "single_resources";
  const isAdminResource = isResource && /-x(?:1|3|6)$/.test(product.slug);
  const iconKind = itemKindFromProduct(product);

  return (
    <section className="shell py-16 sm:py-20">
      <div className={`panel pixel-corners overflow-hidden rounded-sm border p-7 sm:p-10 ${visual.frame}`}>
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div className="relative min-h-80 overflow-hidden rounded-sm border border-white/10 bg-black/25">
            <div className="absolute inset-0 bg-grid-fade bg-[length:48px_48px] opacity-60" />
            <div className="absolute left-8 top-8 h-16 w-16 border border-moss/25 bg-moss/10" />
            <div className="absolute bottom-8 right-8 h-24 w-16 border border-blood/25 bg-blood/10" />
            <div className="relative grid min-h-80 place-items-center">
              <div className={`item-cube grid h-44 w-44 place-items-center border border-white/10 bg-black/25 ${isLegendary ? "animate-gold-pulse" : "shadow-glow"}`}>
                <ItemIcon kind={iconKind} size="xl" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-sm border px-3 py-1 text-xs font-black uppercase ${visual.badge}`}>
                {isLegendary ? "Адмін-чари" : categoryLabels[product.category] ?? product.category}
              </span>
              {isLegendary ? (
                <span className="rounded-sm border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-black uppercase text-gold">
                  Неможливо у survival
                </span>
              ) : null}
              {isAdminResource ? (
                <span className="rounded-sm border border-ward/35 bg-ward/10 px-3 py-1 text-xs font-black uppercase text-ward">
                  Адмін-чари
                </span>
              ) : null}
              {isAdminResource ? (
                <span className="rounded-sm border border-gold/35 bg-gold/10 px-3 py-1 text-xs font-black uppercase text-gold">
                  Неможливо у survival
                </span>
              ) : null}
              <span className="rounded-sm border border-white/10 bg-white/5 px-3 py-1 text-xs font-black uppercase text-fog/70">
                Для кого: {teamLabels[product.team] ?? product.team}
              </span>
            </div>
            <h1 className="voxel-title mt-5 text-4xl font-black uppercase leading-tight text-white sm:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-lg leading-8 text-fog/70">{product.description}</p>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="block-surface rounded-sm border border-white/10 p-4">
                <p className="text-xs font-black uppercase text-fog/50">Ціна</p>
                <p className={`mt-2 text-3xl font-black ${visual.price}`}>{formatTalers(product.price)}</p>
              </div>
              <div className="block-surface rounded-sm border border-white/10 p-4">
                <p className="text-xs font-black uppercase text-fog/50">Категорія</p>
                <p className="mt-2 font-black text-white">{categoryLabels[product.category] ?? product.category}</p>
              </div>
              <div className="block-surface rounded-sm border border-white/10 p-4">
                <p className="text-xs font-black uppercase text-fog/50">Стиль гри</p>
                <p className="mt-2 font-black text-white">{teamLabels[product.team] ?? product.team}</p>
              </div>
            </div>

            <Link
              href={`/checkout/${product.slug}`}
              className={`menu-button mt-8 inline-flex w-full items-center justify-center gap-2 rounded-sm px-7 py-4 text-base font-black uppercase transition hover:-translate-y-1 sm:w-auto ${visual.cta}`}
            >
              Купити за талери
              <ArrowRight size={20} />
            </Link>
            <CartButton
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description,
                price: product.price,
                category: product.category,
                team: product.team,
                iconKind
              }}
              className="mt-3 w-full sm:ml-3 sm:mt-8 sm:w-auto"
            />
            <p className="mt-4 max-w-xl rounded-sm border border-moss/30 bg-moss/10 px-4 py-3 text-sm font-bold text-acid">
              Купівля доступна 24/7. Видача після старту стріму та відкриття сервера.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <section className="panel rounded-sm p-6">
          <p className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase text-white">
            <PackageOpen size={18} className={isLegendary ? "text-gold" : "text-moss"} />
            {isResource ? "Склад ресурсу" : "Склад набору"}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {(contents.length ? contents : ["Склад уточнюється адміністратором"]).map((item) => (
              <li key={item} className="flex gap-3 rounded-sm border border-white/10 bg-black/20 p-4 text-fog/75">
                <CheckCircle2 className={`mt-0.5 shrink-0 ${isLegendary ? "text-gold" : "text-moss"}`} size={18} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel rounded-sm p-6">
          <p className="mb-5 inline-flex items-center gap-2 text-sm font-black uppercase text-white">
            <Info size={18} className={isLegendary ? "text-gold" : "text-acid"} />
            {isResource ? "Переваги ресурсу" : "Переваги набору"}
          </p>
          <div className="grid gap-3">
            {(benefits.length ? benefits : ["Підходить для швидкої участі в івенті."]).map((item) => (
              <div key={item} className="rounded-sm border border-white/10 bg-white/5 p-4 leading-7 text-fog/70">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="danger-frame mt-6 rounded-sm border p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-1 shrink-0 text-lava" size={22} />
          <div>
            <h2 className="font-black text-white">Важливо</h2>
            <p className="mt-2 leading-7 text-fog/70">
              Ресурси можна придбати у будь-який час. Видача відбудеться одразу після початку стріму
              та відкриття сервера. Minecraft-команди доступні тільки в адмін-панелі.
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length ? (
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-moss">
                {isResource ? "Схожі ресурси" : "Схожі набори"}
              </p>
              <h2 className="mt-2 text-3xl font-black text-white">Ще в цій категорії</h2>
            </div>
            <Link className="font-black text-acid transition hover:text-white" href={`/shop#${product.category}`}>
              До категорії
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedProducts.map((related) => (
              <Link key={related.id} href={`/shop/${related.slug}`} className="panel shop-card rounded-sm p-5 hover:border-moss/40">
                <h3 className="text-xl font-black text-white">{related.name}</h3>
                <p className="mt-3 text-sm leading-6 text-fog/60">{related.description}</p>
                <p className={`mt-4 font-black ${visual.price}`}>{formatTalers(related.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
