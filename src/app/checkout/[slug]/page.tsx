import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, PackageOpen, ShieldCheck, Wallet } from "lucide-react";
import { ItemIcon, itemKindFromProduct, itemKindFromText } from "@/components/ItemIcon";
import { prisma } from "@/lib/prisma";
import { categoryLabels, parseTextList, teamLabels } from "@/lib/catalog";
import { formatTalers } from "@/lib/currency";
import { getCurrentUser } from "@/lib/user-auth";
import CheckoutForm from "./CheckoutForm";

type CheckoutPageProps = {
  params: {
    slug: string;
  };
};

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const [product, user] = await Promise.all([
    prisma.product.findFirst({
      where: {
        slug: params.slug,
        isActive: true
      }
    }),
    getCurrentUser()
  ]);

  if (!product) {
    notFound();
  }

  if (!user) {
    redirect(`/login?next=/checkout/${encodeURIComponent(params.slug)}`);
  }

  const contents = parseTextList(product.contents);
  const benefits = parseTextList(product.benefits);
  const isLegendary = product.category === "gods";
  const iconKind = itemKindFromProduct(product);

  return (
    <section className="shell py-16 sm:py-20">
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">Оформлення замовлення</p>
          <h1 className="voxel-title mt-3 text-4xl font-black uppercase text-white">Фінальний крок</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-fog/70">
            Перевір товар, контакт для видачі й підтвердь покупку за талери з балансу.
          </p>
          <p className="mt-4 inline-flex rounded-sm border border-moss/30 bg-moss/10 px-4 py-3 font-bold text-acid">
            Купівля доступна 24/7. Видача буде після старту стріму та відкриття сервера.
          </p>
        </div>
        <Link href={`/shop/${product.slug}`} className="font-black text-acid transition hover:text-white">
          Повернутися до товару
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className={`panel h-fit rounded-sm p-6 ${isLegendary ? "legendary-frame shadow-goldglow" : ""}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className={`rounded-sm border px-3 py-1 text-xs font-black uppercase ${isLegendary ? "border-gold/60 bg-gold text-bunker" : "border-moss/25 bg-moss/10 text-moss"}`}>
                {isLegendary ? "LEGENDARY" : categoryLabels[product.category] ?? product.category}
              </span>
              <h2 className="mt-4 text-3xl font-black text-white">{product.name}</h2>
            </div>
            <div className="item-cube grid h-14 w-14 place-items-center border border-white/10 bg-white/10">
              <ItemIcon kind={iconKind} size="md" />
            </div>
          </div>

          <p className="mt-4 leading-8 text-fog/70">{product.description}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="block-surface rounded-sm border border-white/10 p-4">
              <p className="text-xs font-black uppercase text-fog/50">Сума</p>
              <p className={`mt-1 text-3xl font-black ${isLegendary ? "text-gold" : "text-acid"}`}>
                {formatTalers(product.price)}
              </p>
            </div>
            <div className="block-surface rounded-sm border border-white/10 p-4">
              <p className="text-xs font-black uppercase text-fog/50">Для кого</p>
              <p className="mt-2 text-lg font-black text-white">{teamLabels[product.team] ?? product.team}</p>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase text-white">
              <PackageOpen size={16} className={isLegendary ? "text-gold" : "text-moss"} />
              Основні предмети
            </p>
            <ul className="space-y-2 text-sm leading-6 text-fog/75">
              {(contents.length ? contents.slice(0, 6) : ["Склад уточнюється адміністратором"]).map((item) => (
                <li key={item} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2">
                  <span className="item-cube grid h-7 w-7 shrink-0 place-items-center border border-white/10 bg-black/25">
                    <ItemIcon kind={itemKindFromText(item, iconKind)} size="xs" />
                  </span>
                  <span className="flex min-w-0 items-start gap-2">
                    <CheckCircle2 size={15} className={`mt-1 shrink-0 ${isLegendary ? "text-gold" : "text-moss"}`} />
                    <span>{item}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase text-white">
              <ShieldCheck size={16} className="text-ward" />
              Переваги
            </p>
            <ul className="space-y-2 text-sm leading-6 text-fog/70">
              {(benefits.length ? benefits.slice(0, 3) : ["Підходить для швидкої участі в івенті"]).map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-acid" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="danger-frame mt-6 rounded-sm border p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-1 shrink-0 text-lava" size={20} />
              <p className="text-sm leading-6 text-fog/70">
                Товар видається адміністратором після підтвердження оплати, старту стріму та відкриття сервера.
              </p>
            </div>
          </div>
        </aside>

        <CheckoutForm
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price
          }}
          initialUser={user}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
            "Сума перевіряється на сервері",
            "Контакти потрібні для швидкої видачі",
          "Команди видачі є тільки в адмін-панелі"
        ].map((item) => (
          <div key={item} className="panel rounded-sm p-4">
            <Wallet className="text-moss" size={22} />
            <p className="mt-3 font-bold text-fog/75">{item}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
