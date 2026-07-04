import type { Metadata } from "next";
import Link from "next/link";
import { Info, Wallet } from "lucide-react";
import { itemKindFromProduct } from "@/components/ItemIcon";
import { prisma } from "@/lib/prisma";
import { siteInfo } from "@/lib/site";
import { PUBLIC_PRODUCT_WHERE } from "@/lib/storefront";
import { ShopCatalog } from "./ShopCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `Магазин | ${siteInfo.name}`,
  description: "Каталог наборів, шалкерів, ресурсів і суперпредметів для Minecraft-виживання."
};

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: PUBLIC_PRODUCT_WHERE,
    orderBy: [{ category: "asc" }, { price: "asc" }]
  });

  const catalogProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    category: product.category,
    team: product.team,
    contents: product.contents,
    benefits: product.benefits,
    iconKind: itemKindFromProduct(product)
  }));

  return (
    <section className="shell py-20 sm:py-24">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.42fr] lg:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">Minecraft-магазин</p>
          <h1 className="voxel-title mt-4 text-5xl font-black uppercase leading-tight text-white">
            Ресурси, шалкери й набори
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-fog/72">
            Ресурси можна придбати у будь-який час. Видача відбудеться після підтвердження замовлення адміністратором і відкриття сервера.
          </p>
          <p className="mt-3 max-w-3xl leading-7 text-fog/65">
            Обирайте готові комплекти або окремі предмети для виживання з модами. Оплата проходить талерами з балансу акаунта.
          </p>
        </div>
        <div className="panel rounded-sm border-moss/30 p-5 shadow-glow">
          <div className="flex items-start gap-4">
            <Info className="mt-1 shrink-0 text-acid" size={24} />
            <div>
              <p className="font-black text-white">Купівля доступна 24/7 за талери</p>
              <p className="mt-2 text-sm leading-6 text-fog/65">
                Додавайте товари в кошик або купуйте один набір одразу. Остаточна сума перевіряється на сервері.
              </p>
              <Link href="/top-up" className="mt-4 inline-flex items-center gap-2 font-black text-acid transition hover:text-white">
                <Wallet size={16} />
                Поповнити баланс
              </Link>
            </div>
          </div>
        </div>
      </div>

      <ShopCatalog products={catalogProducts} />
    </section>
  );
}
