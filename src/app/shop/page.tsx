import type { Metadata } from "next";
import Link from "next/link";
import { Info, Wallet } from "lucide-react";
import { itemKindFromProduct } from "@/components/ItemIcon";
import { prisma } from "@/lib/prisma";
import { ShopCatalog } from "./ShopCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Магазин | Zombie Event Shop",
  description: "Каталог наборів, шалкерів, ресурсів і суперпредметів для Minecraft-івенту Зомбі проти людей."
};

export default async function ShopPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
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
          <p className="text-sm font-black uppercase tracking-wide text-moss">Minecraft-крамниця івенту</p>
          <h1 className="voxel-title mt-4 text-5xl font-black uppercase leading-tight text-white">
            Ресурси, шалкери й набори
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-fog/72">
            Ресурси можна придбати у будь-який час. Видача відбудеться одразу після початку стріму та відкриття сервера.
          </p>
          <p className="mt-3 max-w-3xl leading-7 text-fog/65">
            Вхід на івент безкоштовний. Купівля наборів — це добровільна підтримка стріму.
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
