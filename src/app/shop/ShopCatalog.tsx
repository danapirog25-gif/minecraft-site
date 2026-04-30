"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  CheckCircle2,
  PackageOpen,
  Search,
  SlidersHorizontal,
  Wallet,
  X
} from "lucide-react";
import { CartButton } from "@/components/CartButton";
import type { CartProduct } from "@/components/cart-storage";
import { ItemIcon, itemKindFromProduct } from "@/components/ItemIcon";
import { categoryMeta, parseTextList, teamLabels } from "@/lib/catalog";
import { formatTalers } from "@/lib/currency";

export type CatalogProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  team: string;
  contents: string | null;
  benefits: string | null;
  iconKind: string;
};

const categoryStyles: Record<
  string,
  {
    card: string;
    badge: string;
    price: string;
    button: string;
    iconKind: string;
  }
> = {
  starter: {
    card: "hover:border-moss/40 hover:shadow-glow",
    badge: "border-moss/25 bg-moss/10 text-moss",
    price: "text-acid",
    button: "bg-moss text-bunker hover:bg-acid",
    iconKind: "iron_chestplate"
  },
  survival_shulkers: {
    card: "ward-frame hover:shadow-glow",
    badge: "border-ward/25 bg-ward/10 text-ward",
    price: "text-ward",
    button: "bg-ward text-bunker hover:bg-cyan-200",
    iconKind: "shulker_box"
  },
  combat_shulkers: {
    card: "danger-frame hover:shadow-redglow",
    badge: "border-blood/30 bg-blood/10 text-red-100",
    price: "text-lava",
    button: "bg-blood text-white hover:bg-red-400",
    iconKind: "diamond_sword"
  },
  gods: {
    card: "legendary-frame shadow-goldglow",
    badge: "border-gold/60 bg-gold text-bunker",
    price: "text-gold",
    button: "bg-gold text-bunker hover:bg-yellow-300",
    iconKind: "netherite_chestplate"
  },
  single_resources: {
    card: "hover:border-ward/40 hover:shadow-glow",
    badge: "border-ward/25 bg-ward/10 text-ward",
    price: "text-ward",
    button: "bg-moss text-bunker hover:bg-acid",
    iconKind: "diamond"
  },
  event_perks: {
    card: "hover:border-gold/40 hover:shadow-goldglow",
    badge: "border-gold/50 bg-gold/10 text-gold",
    price: "text-gold",
    button: "bg-gold text-bunker hover:bg-yellow-300",
    iconKind: "beacon"
  }
};

type CatalogTab = "bundles" | "resources";
type ResourceTab = "all" | "materials" | "blocks" | "combat" | "weapons" | "tools" | "god_items";

const RESOURCE_CATEGORY_ID = "single_resources";

const catalogTabs: {
  id: CatalogTab;
  title: string;
  description: string;
  iconKind: string;
}[] = [
  {
    id: "bundles",
    title: "Набори",
    description: "Стартові комплекти, шалкери, суперпредмети та івент-послуги.",
    iconKind: "shulker_box"
  },
  {
    id: "resources",
    title: "Ресурси окремо",
    description: "Алмази, злитки, тотеми й інші позиції, які можна докупити окремо.",
    iconKind: "diamond"
  }
];

const resourceTabs: {
  id: ResourceTab;
  title: string;
  description: string;
  iconKind: string;
}[] = [
  {
    id: "all",
    title: "Усі",
    description: "Усі окремі ресурси й предмети.",
    iconKind: "diamond"
  },
  {
    id: "materials",
    title: "Матеріали",
    description: "Алмази, злитки, редстоун і крафтові ресурси.",
    iconKind: "netherite_ingot"
  },
  {
    id: "blocks",
    title: "Блоки",
    description: "Будівельні блоки, маяки й контейнери.",
    iconKind: "cobblestone"
  },
  {
    id: "combat",
    title: "Бій",
    description: "Тотеми, перли, яблука та інші речі для виживання.",
    iconKind: "totem_of_undying"
  },
  {
    id: "weapons",
    title: "Зброя",
    description: "Звичайна зброя без адмін-чарів.",
    iconKind: "iron_sword"
  },
  {
    id: "tools",
    title: "Інструменти",
    description: "Кирки, сокири, лопати й корисні дрібниці.",
    iconKind: "diamond_pickaxe"
  },
  {
    id: "god_items",
    title: "Речі Бога",
    description: "Адмін-зброя, броня, суперчари й зілля.",
    iconKind: "netherite_chestplate"
  }
];

const resourceTabByGroupSlug: Record<string, Exclude<ResourceTab, "all">> = {
  diamonds: "materials",
  emeralds: "materials",
  "iron-ingots": "materials",
  "gold-ingots": "materials",
  redstone: "materials",
  coal: "materials",
  "lapis-lazuli": "materials",
  quartz: "materials",
  "glowstone-dust": "materials",
  gunpowder: "materials",
  string: "materials",
  "slime-balls": "materials",
  "blaze-rods": "materials",
  leather: "materials",
  paper: "materials",
  books: "materials",
  "experience-bottles": "materials",
  "netherite-ingots": "materials",
  "shulker-shells": "materials",
  cobblestone: "blocks",
  "oak-planks": "blocks",
  stone: "blocks",
  dirt: "blocks",
  netherrack: "blocks",
  "stone-bricks": "blocks",
  "cobbled-deepslate": "blocks",
  sand: "blocks",
  gravel: "blocks",
  "oak-logs": "blocks",
  obsidian: "blocks",
  glass: "blocks",
  ladders: "blocks",
  torches: "blocks",
  "crafting-tables": "blocks",
  furnaces: "blocks",
  tnt: "blocks",
  shulkers: "blocks",
  beacons: "blocks",
  totems: "combat",
  "ender-pearls": "combat",
  "golden-apples": "combat",
  "enchanted-golden-apples": "combat",
  arrows: "combat",
  shields: "combat",
  "cooked-beef": "combat",
  bread: "combat",
  "water-buckets": "combat",
  "lava-buckets": "combat",
  "milk-buckets": "combat",
  "healing-potions": "combat",
  "swiftness-potions": "combat",
  "strength-potions": "combat",
  "regeneration-potions": "combat",
  "fire-resistance-potions": "combat",
  "regular-bows": "weapons",
  crossbows: "weapons",
  "iron-swords": "weapons",
  "regular-diamond-swords": "weapons",
  "iron-pickaxes": "tools",
  "diamond-pickaxes": "tools",
  "iron-axes": "tools",
  "diamond-axes": "tools",
  "iron-shovels": "tools",
  "diamond-shovels": "tools",
  shears: "tools",
  "flint-and-steel": "tools",
  "fishing-rods": "tools",
  tridents: "god_items",
  bows: "god_items",
  "diamond-swords": "god_items",
  "netherite-swords": "god_items",
  "diamond-chestplates": "god_items",
  "netherite-chestplates": "god_items",
  "admin-potions": "god_items"
};

const resourceOrder = [
  "diamonds",
  "emeralds",
  "iron-ingots",
  "gold-ingots",
  "redstone",
  "coal",
  "lapis-lazuli",
  "quartz",
  "glowstone-dust",
  "gunpowder",
  "string",
  "slime-balls",
  "blaze-rods",
  "leather",
  "paper",
  "books",
  "experience-bottles",
  "cobblestone",
  "oak-planks",
  "stone",
  "dirt",
  "netherrack",
  "stone-bricks",
  "cobbled-deepslate",
  "sand",
  "gravel",
  "oak-logs",
  "glass",
  "ladders",
  "torches",
  "obsidian",
  "crafting-tables",
  "furnaces",
  "tnt",
  "netherite-ingots",
  "totems",
  "ender-pearls",
  "golden-apples",
  "enchanted-golden-apples",
  "arrows",
  "shields",
  "cooked-beef",
  "bread",
  "water-buckets",
  "lava-buckets",
  "milk-buckets",
  "healing-potions",
  "swiftness-potions",
  "strength-potions",
  "regeneration-potions",
  "fire-resistance-potions",
  "regular-bows",
  "crossbows",
  "iron-swords",
  "regular-diamond-swords",
  "iron-pickaxes",
  "diamond-pickaxes",
  "iron-axes",
  "diamond-axes",
  "iron-shovels",
  "diamond-shovels",
  "shears",
  "flint-and-steel",
  "fishing-rods",
  "shulker-shells",
  "shulkers",
  "beacons",
  "tridents",
  "bows",
  "diamond-swords",
  "netherite-swords",
  "diamond-chestplates",
  "netherite-chestplates",
  "admin-potions"
];

function categoryBelongsToTab(categoryId: string, tab: CatalogTab) {
  return tab === "resources" ? categoryId === RESOURCE_CATEGORY_ID : categoryId !== RESOURCE_CATEGORY_ID;
}

function resourceGroupBelongsToTab(groupSlug: string, tab: ResourceTab) {
  return tab === "all" || resourceTabByGroupSlug[groupSlug] === tab;
}

function getStyle(categoryId: string) {
  return categoryStyles[categoryId] ?? categoryStyles.starter;
}

function getResourceVariant(product: CatalogProduct) {
  const match = product.slug.match(/-x(\d+)$/);
  const amount = match ? Number(match[1]) : 16;
  const quantity = `x${amount}`;
  const groupSlug = match ? product.slug.slice(0, -match[0].length) : product.slug;
  const title = product.name.replace(/\s+x\d+$/i, "");

  return {
    amount,
    groupSlug,
    quantity,
    title
  };
}

function groupResourceProducts(products: CatalogProduct[]) {
  const groups = new Map<string, { title: string; products: CatalogProduct[] }>();

  for (const product of products) {
    const variant = getResourceVariant(product);
    const current = groups.get(variant.groupSlug) ?? { title: variant.title, products: [] };
    current.products.push(product);
    groups.set(variant.groupSlug, current);
  }

  return Array.from(groups.entries())
    .map(([slug, group]) => ({
      slug,
      title: group.title,
      products: group.products.sort((a, b) => getResourceVariant(a).amount - getResourceVariant(b).amount)
    }))
    .sort((a, b) => {
      const aIndex = resourceOrder.indexOf(a.slug);
      const bIndex = resourceOrder.indexOf(b.slug);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    });
}

function toCartProduct(product: CatalogProduct): CartProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    category: product.category,
    team: product.team,
    iconKind: product.iconKind || itemKindFromProduct(product)
  };
}

function productBadges(product: CatalogProduct) {
  const badges: { label: string; className: string }[] = [];

  if (product.category === "gods") {
    badges.push({ label: "Адмін-чари", className: "border-gold/50 bg-gold/10 text-gold" });
    badges.push({ label: "Неможливо у survival", className: "border-lava/40 bg-lava/10 text-orange-100" });
  }

  if (product.category === RESOURCE_CATEGORY_ID) {
    const variant = getResourceVariant(product);
    if (variant.amount < 16) {
      badges.push({ label: "Адмін-предмет", className: "border-ward/35 bg-ward/10 text-ward" });
    } else {
      badges.push({ label: "Від 16 шт.", className: "border-moss/30 bg-moss/10 text-acid" });
    }
  }

  if (product.name.toLowerCase().includes("шалкер")) {
    badges.push({ label: "Шалкер", className: "border-ward/35 bg-ward/10 text-ward" });
  }

  if (product.price >= 200) {
    badges.push({ label: "Premium", className: "border-gold/45 bg-gold/10 text-gold" });
  }

  if (product.category === "event_perks") {
    badges.push({ label: "На весь івент", className: "border-gold/45 bg-gold/10 text-gold" });
  }

  return badges.slice(0, 3);
}

function ProductCard({ product, categoryTitle }: { product: CatalogProduct; categoryTitle: string }) {
  const style = getStyle(product.category);
  const contents = parseTextList(product.contents);
  const benefits = parseTextList(product.benefits);
  const isLegendary = product.category === "gods";
  const badges = productBadges(product);

  return (
    <article className={`panel shop-card flex min-h-[620px] flex-col rounded-sm p-6 ${style.card}`}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="item-cube grid h-20 w-20 shrink-0 place-items-center border border-white/10 bg-black/25">
          <ItemIcon kind={product.iconKind} size="lg" />
        </div>
        <div className="text-right">
          <p className={`rounded-sm bg-black/30 px-3 py-2 text-xl font-black ${style.price}`}>
            {formatTalers(product.price)}
          </p>
          <p className="mt-2 text-xs font-black uppercase text-fog/45">{teamLabels[product.team] ?? product.team}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`rounded-sm border px-2.5 py-1 text-xs font-black uppercase ${style.badge}`}>
          {categoryTitle}
        </span>
        {badges.map((badge) => (
          <span key={badge.label} className={`rounded-sm border px-2.5 py-1 text-xs font-black uppercase ${badge.className}`}>
            {badge.label}
          </span>
        ))}
      </div>

      <h3 className="mt-5 text-2xl font-black text-white">{product.name}</h3>
      <p className="mt-3 flex-1 leading-7 text-fog/70">{product.description}</p>

      <div className="mt-6 grid gap-5 border-t border-white/10 pt-5">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 text-sm font-black uppercase text-white">
            <PackageOpen size={16} className={isLegendary ? "text-gold" : "text-moss"} />
            Усередині
          </p>
          <ul className="space-y-2 text-sm leading-6 text-fog/75">
            {(contents.length ? contents.slice(0, 5) : ["Склад уточнюється адміністратором"]).map((item) => (
              <li key={item} className="flex gap-2">
                <CheckCircle2 size={15} className={`mt-1 shrink-0 ${isLegendary ? "text-gold" : "text-moss"}`} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="rounded-sm border border-white/10 bg-white/5 p-3 text-sm leading-6 text-fog/65">
          {benefits[0] ?? "Корисний набір для івенту."}
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/shop/${product.slug}`}
          className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/10 px-4 py-3 font-black text-white transition hover:-translate-y-1 hover:bg-white/20"
        >
          Деталі
        </Link>
        <Link
          href={`/checkout/${product.slug}`}
          className={`menu-button inline-flex items-center justify-center gap-2 rounded-sm px-4 py-3 font-black uppercase transition hover:-translate-y-1 ${style.button}`}
        >
          Купити
          <ArrowRight size={18} />
        </Link>
      </div>
      <CartButton product={toCartProduct(product)} className="mt-3 w-full" />
    </article>
  );
}

function ResourceCard({ group }: { group: { slug: string; title: string; products: CatalogProduct[] } }) {
  const first = group.products[0];
  const style = getStyle("single_resources");
  const contents = parseTextList(first.contents);
  const variants = group.products.map((product) => ({ product, variant: getResourceVariant(product) }));
  const minAmount = Math.min(...variants.map(({ variant }) => variant.amount));
  const isStackableQuantity = minAmount >= 16;
  const isGodItem = resourceTabByGroupSlug[group.slug] === "god_items";
  const badgeLabel = isGodItem ? "Адмін-чари" : isStackableQuantity ? `від ${minAmount} шт.` : "Звичайний предмет";
  const variantHint = isGodItem ? "Неможливо у survival" : isStackableQuantity ? "Мінімум від 16 шт." : "Звичайний survival-предмет";

  return (
    <article className={`panel shop-card flex min-h-[470px] flex-col rounded-sm p-6 ${style.card}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="item-cube grid h-24 w-24 shrink-0 place-items-center border border-ward/25 bg-ward/10">
          <ItemIcon kind={first.iconKind} size="lg" />
        </div>
        <span className="rounded-sm border border-moss/30 bg-moss/10 px-2.5 py-1 text-xs font-black uppercase text-acid">
          {badgeLabel}
        </span>
      </div>

      <h3 className="mt-6 text-2xl font-black text-white">{group.title}</h3>
      <p className="mt-3 leading-7 text-fog/65">
        {contents[0] ?? `Ресурс продається наборами від ${minAmount} шт.`}
      </p>

      <div className="mt-6 rounded-sm border border-ward/20 bg-black/25 p-4">
        <p className="text-sm font-black uppercase text-ward">
          {isGodItem ? "Виберіть силу набору" : "Виберіть кількість"}
        </p>
        <div className="mt-4 grid gap-3">
          {variants.map(({ product, variant }) => (
            <div
              key={product.id}
              className="grid gap-3 rounded-sm border border-white/10 bg-white/5 px-3 py-3 transition hover:border-moss/40 hover:bg-moss/10 sm:grid-cols-[72px_minmax(0,1fr)] sm:items-center"
            >
              <span className="rounded-sm bg-moss px-2 py-2 text-center font-black text-bunker">{variant.quantity}</span>
              <div className="min-w-0">
                <p className="text-sm font-bold leading-5 text-fog/75">
                  {variantHint}
                </p>
                <p className="mt-1 font-black text-acid">{formatTalers(product.price)}</p>
              </div>
              <CartButton product={toCartProduct(product)} compact className="sm:col-span-2" />
            </div>
          ))}
        </div>
      </div>

      <Link
        href={`/shop/${first.slug}`}
        className="mt-auto inline-flex items-center gap-2 pt-6 font-black text-acid transition hover:text-white"
      >
        Деталі ресурсу
        <ArrowRight size={17} />
      </Link>
    </article>
  );
}

type FilterState = {
  query: string;
  category: string;
  team: string;
  sort: "category" | "price_asc" | "price_desc";
};

const initialFilters: FilterState = {
  query: "",
  category: "all",
  team: "all",
  sort: "category"
};

function matchesQuery(product: CatalogProduct, query: string) {
  if (!query) {
    return true;
  }

  const haystack = [
    product.name,
    product.description,
    product.slug,
    teamLabels[product.team] ?? product.team,
    parseTextList(product.contents).join(" "),
    parseTextList(product.benefits).join(" ")
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query.toLowerCase());
}

function sortProducts(products: CatalogProduct[], sort: FilterState["sort"]) {
  const categoryIndex = new Map<string, number>(categoryMeta.map((category, index) => [category.id, index]));

  return [...products].sort((a, b) => {
    if (sort === "price_asc") {
      return a.price - b.price;
    }
    if (sort === "price_desc") {
      return b.price - a.price;
    }

    return (categoryIndex.get(a.category) ?? 999) - (categoryIndex.get(b.category) ?? 999) || a.price - b.price;
  });
}

export function ShopCatalog({ products }: { products: CatalogProduct[] }) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [activeTab, setActiveTab] = useState<CatalogTab>("bundles");
  const [activeResourceTab, setActiveResourceTab] = useState<ResourceTab>("all");

  useEffect(() => {
    const syncTabWithHash = () => {
      const hashCategory = window.location.hash.replace("#", "");
      const targetCategory = categoryMeta.find((category) => category.id === hashCategory);

      if (targetCategory) {
        setActiveTab(categoryBelongsToTab(targetCategory.id, "resources") ? "resources" : "bundles");
        setActiveResourceTab("all");
        setFilters((current) => ({ ...current, category: "all" }));
      }
    };

    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);
    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  useEffect(() => {
    const hashCategory = window.location.hash.replace("#", "");

    if (!hashCategory || !categoryBelongsToTab(hashCategory, activeTab)) {
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById(hashCategory)?.scrollIntoView();
    });
  }, [activeTab]);

  const activeCategoryMeta = useMemo(
    () => categoryMeta.filter((category) => categoryBelongsToTab(category.id, activeTab)),
    [activeTab]
  );

  const tabCounts = useMemo(() => {
    const resourceProducts = products.filter((product) => product.category === RESOURCE_CATEGORY_ID);

    return {
      bundles: products.filter((product) => product.category !== RESOURCE_CATEGORY_ID).length,
      resources: groupResourceProducts(resourceProducts).length
    };
  }, [products]);

  const baseFilteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const tabMatches = categoryBelongsToTab(product.category, activeTab);
      const categoryMatches = filters.category === "all" || product.category === filters.category;
      const teamMatches = filters.team === "all" || product.team === filters.team;
      return tabMatches && categoryMatches && teamMatches && matchesQuery(product, filters.query.trim());
    });

    return sortProducts(filtered, filters.sort);
  }, [activeTab, filters, products]);

  const resourceGroupsBeforeTypeFilter = useMemo(
    () => groupResourceProducts(baseFilteredProducts.filter((product) => product.category === RESOURCE_CATEGORY_ID)),
    [baseFilteredProducts]
  );

  const resourceTabCounts = useMemo(() => {
    const counts = Object.fromEntries(resourceTabs.map((tab) => [tab.id, 0])) as Record<ResourceTab, number>;
    counts.all = resourceGroupsBeforeTypeFilter.length;

    for (const group of resourceGroupsBeforeTypeFilter) {
      const tab = resourceTabByGroupSlug[group.slug] ?? "materials";
      counts[tab] += 1;
    }

    return counts;
  }, [resourceGroupsBeforeTypeFilter]);

  useEffect(() => {
    if (activeResourceTab === "all" || resourceTabCounts[activeResourceTab] > 0) {
      return;
    }

    setActiveResourceTab(activeResourceTab === "weapons" && resourceTabCounts.god_items > 0 ? "god_items" : "all");
  }, [activeResourceTab, resourceTabCounts]);

  const visibleResourceTabs = useMemo(
    () => resourceTabs.filter((tab) => tab.id === "all" || resourceTabCounts[tab.id] > 0),
    [resourceTabCounts]
  );

  const filteredProducts = useMemo(() => {
    if (activeTab !== "resources" || activeResourceTab === "all") {
      return baseFilteredProducts;
    }

    return baseFilteredProducts.filter((product) => {
      const groupSlug = getResourceVariant(product).groupSlug;
      return resourceGroupBelongsToTab(groupSlug, activeResourceTab);
    });
  }, [activeResourceTab, activeTab, baseFilteredProducts]);

  const visibleCategories = activeCategoryMeta.filter((category) => {
    if (filters.category !== "all" && filters.category !== category.id) {
      return false;
    }
    return filteredProducts.some((product) => product.category === category.id);
  });

  const filteredResourceGroups = useMemo(
    () => groupResourceProducts(filteredProducts.filter((product) => product.category === RESOURCE_CATEGORY_ID)),
    [filteredProducts]
  );

  const hasFilters = JSON.stringify(filters) !== JSON.stringify(initialFilters) || (activeTab === "resources" && activeResourceTab !== "all");
  const foundCount = activeTab === "resources" ? filteredResourceGroups.length : filteredProducts.length;
  const foundLabel = activeTab === "resources" ? "ресурсів" : "товарів";
  const allCategoriesLabel = activeTab === "resources" ? "Усі ресурси" : "Усі набори";
  const categoryStatLabel = activeTab === "resources" ? "Підрозділів" : "Категорій";
  const categoryStatValue =
    activeTab === "resources"
      ? visibleResourceTabs.filter((tab) => tab.id !== "all").length
      : visibleCategories.length;

  const selectTab = (tab: CatalogTab) => {
    setActiveTab(tab);
    setFilters((current) => ({ ...current, category: "all" }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
    setActiveResourceTab("all");
  };

  return (
    <>
      <section className="mt-12 rounded-sm border-2 border-moss/30 bg-black/35 p-4 shadow-glow">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-acid">Оберіть розділ магазину</p>
            <h2 className="mt-1 text-3xl font-black uppercase text-white">Набори чи ресурси?</h2>
          </div>
          <span className="w-fit rounded-sm border border-gold/35 bg-gold/10 px-3 py-2 text-xs font-black uppercase text-gold">
            Крок 1 перед фільтрами
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2" role="tablist" aria-label="Розділи магазину">
          {catalogTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const isResources = tab.id === "resources";
            const countLabel = isResources ? `${tabCounts.resources} ресурсів` : `${tabCounts.bundles} товарів`;
            const activeClasses = isResources
              ? "border-ward/70 bg-ward/15 shadow-glow ring-2 ring-ward/35"
              : "border-gold/70 bg-gold/15 shadow-goldglow ring-2 ring-gold/35";
            const activeStrip = isResources ? "bg-ward" : "bg-gold";
            const activeIcon = isResources ? "border-ward/50 bg-ward/15" : "border-gold/50 bg-gold/15";
            const activeBadge = isResources ? "border-ward/45 bg-ward text-bunker" : "border-gold/45 bg-gold text-bunker";

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => selectTab(tab.id)}
                className={`group relative min-h-[156px] overflow-hidden rounded-sm border-2 p-5 text-left transition hover:-translate-y-1 ${
                  isActive
                    ? activeClasses
                    : "border-white/15 bg-black/35 text-fog/70 hover:border-moss/35 hover:bg-white/5"
                }`}
              >
                <span className={`absolute inset-y-0 left-0 w-2 ${isActive ? activeStrip : "bg-white/10"}`} />
                <span className="grid gap-4 sm:grid-cols-[72px_minmax(0,1fr)] sm:items-center">
                  <span className={`item-cube grid h-20 w-20 place-items-center border ${isActive ? activeIcon : "border-white/10 bg-black/25"}`}>
                    <ItemIcon kind={tab.iconKind} size="lg" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={`block text-3xl font-black uppercase leading-tight ${isActive ? "text-white" : "text-fog/85"}`}>{tab.title}</span>
                      {isActive ? (
                        <span className={`rounded-sm border px-2 py-1 text-xs font-black uppercase ${activeBadge}`}>
                          Активно
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-2 block text-base font-bold leading-7 text-fog/68">{tab.description}</span>
                    <span className={`mt-3 inline-block rounded-sm border px-3 py-1.5 text-sm font-black uppercase ${isActive ? activeBadge : "border-white/10 bg-white/5 text-fog/55"}`}>
                      {countLabel}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="mt-4 grid gap-4 rounded-sm border border-white/10 bg-black/20 p-4 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_auto] lg:items-end">
        <label className="grid gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-black uppercase text-fog/60">
            <Search size={16} className="text-moss" />
            Пошук
          </span>
          <input
            value={filters.query}
            onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            placeholder="меч, шалкер, алмази..."
            className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
          />
        </label>

        <label className="grid gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-black uppercase text-fog/60">
            <SlidersHorizontal size={16} className="text-ward" />
            Категорія
          </span>
          <select
            value={filters.category}
            onChange={(event) => setFilters((current) => ({ ...current, category: event.target.value }))}
            className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
          >
            <option value="all">{allCategoriesLabel}</option>
            {activeCategoryMeta.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black uppercase text-fog/60">Для кого</span>
          <select
            value={filters.team}
            onChange={(event) => setFilters((current) => ({ ...current, team: event.target.value }))}
            className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
          >
            <option value="all">Усі</option>
            <option value="humans">Люди</option>
            <option value="zombies">Зомбі</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="inline-flex items-center gap-2 text-sm font-black uppercase text-fog/60">
            <ArrowUpDown size={16} className="text-gold" />
            Сортування
          </span>
          <select
            value={filters.sort}
            onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value as FilterState["sort"] }))}
            className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 outline-none transition focus:border-moss focus:shadow-glow"
          >
            <option value="category">За категорією</option>
            <option value="price_asc">Дешевші спершу</option>
            <option value="price_desc">Дорожчі спершу</option>
          </select>
        </label>

        <button
          type="button"
          onClick={resetFilters}
          disabled={!hasFilters}
          className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/10 px-4 py-3 font-black text-fog/70 transition hover:bg-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <X size={17} />
          Скинути
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {activeTab === "bundles" ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              type="button"
              onClick={() => setFilters((current) => ({ ...current, category: "all" }))}
              className={`inline-flex shrink-0 items-center gap-3 rounded-sm border px-4 py-3 text-sm font-black uppercase transition hover:-translate-y-1 ${
                filters.category === "all" ? "border-moss/40 bg-moss text-bunker" : "border-white/15 bg-white/5 text-fog/70"
              }`}
            >
              {allCategoriesLabel}
            </button>
            {activeCategoryMeta.map((category) => {
              const style = getStyle(category.id);
              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => setFilters((current) => ({ ...current, category: category.id }))}
                  className={`inline-flex shrink-0 items-center gap-3 rounded-sm border px-4 py-3 text-sm font-black uppercase transition hover:-translate-y-1 ${
                    filters.category === category.id ? "bg-white/15 text-white" : style.badge
                  }`}
                >
                  <ItemIcon kind={style.iconKind} size="sm" />
                  {category.title}
                </button>
              );
            })}
          </div>
        ) : (
          <span />
        )}
        <Link href="/cart" className="inline-flex items-center gap-2 rounded-sm border border-gold/30 bg-gold/10 px-4 py-3 font-black text-gold transition hover:bg-gold/20">
          <Wallet size={17} />
          Оформити кошик
        </Link>
      </div>

      {activeTab === "resources" ? (
        <div className="mt-5 rounded-sm border border-ward/20 bg-black/20 p-3">
          <div className="flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Типи окремих ресурсів">
            {visibleResourceTabs.map((tab) => {
              const isActive = activeResourceTab === tab.id;
              const count = resourceTabCounts[tab.id];

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveResourceTab(tab.id)}
                  className={`grid min-h-[104px] min-w-[178px] shrink-0 grid-cols-[40px_minmax(0,1fr)] gap-3 rounded-sm border p-3 text-left transition hover:-translate-y-1 sm:min-w-[206px] ${
                    isActive
                      ? "border-ward/45 bg-ward/15 text-white shadow-glow"
                      : "border-white/10 bg-white/5 text-fog/68 hover:border-ward/30 hover:bg-ward/10"
                  }`}
                >
                  <span className={`item-cube grid h-10 w-10 place-items-center border ${isActive ? "border-ward/35 bg-ward/10" : "border-white/10 bg-black/25"}`}>
                    <ItemIcon kind={tab.iconKind} size="sm" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-black uppercase leading-5">{tab.title}</span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-fog/58">{tab.description}</span>
                    <span className={`mt-2 inline-block rounded-sm border px-2 py-1 text-[11px] font-black uppercase ${isActive ? "border-ward/35 bg-ward/10 text-ward" : "border-white/10 bg-black/20 text-fog/50"}`}>
                      {count} позицій
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="block-surface rounded-sm border border-white/10 p-4">
          <p className="text-xs font-black uppercase text-fog/50">Знайдено</p>
          <p className="mt-1 text-2xl font-black text-acid">{foundCount} {foundLabel}</p>
        </div>
        <div className="block-surface rounded-sm border border-white/10 p-4">
          <p className="text-xs font-black uppercase text-fog/50">{categoryStatLabel}</p>
          <p className="mt-1 text-2xl font-black text-ward">{categoryStatValue}</p>
        </div>
        <div className="block-surface rounded-sm border border-white/10 p-4">
          <p className="text-xs font-black uppercase text-fog/50">Найдешевший варіант</p>
          <p className="mt-1 text-2xl font-black text-gold">
            {filteredProducts.length ? formatTalers(Math.min(...filteredProducts.map((product) => product.price))) : "немає"}
          </p>
        </div>
      </div>

      <div className="mt-16 space-y-24">
        {visibleCategories.length ? (
          visibleCategories.map((category) => {
            const categoryProducts = filteredProducts.filter((product) => product.category === category.id);
            const style = getStyle(category.id);
            const isResourceCategory = category.id === "single_resources";
            const resourceGroups = groupResourceProducts(categoryProducts);

            return (
              <section key={category.id} id={category.id} className="scroll-mt-24">
                <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-start gap-5">
                    <div className="item-cube grid h-16 w-16 shrink-0 place-items-center border border-white/10 bg-black/25">
                      <ItemIcon kind={style.iconKind} size="md" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white">{category.title}</h2>
                      <p className="mt-3 max-w-3xl leading-7 text-fog/62">{category.description}</p>
                    </div>
                  </div>
                  <span className="rounded-sm border border-white/10 bg-white/5 px-3 py-2 text-sm font-black text-fog/70">
                    {isResourceCategory ? `${resourceGroups.length} ресурсів` : `${categoryProducts.length} товарів`}
                  </span>
                </div>

                {isResourceCategory ? (
                  <div>
                    <div className="mb-6 rounded-sm border border-moss/30 bg-moss/10 p-4 text-sm font-bold leading-6 text-acid">
                      Стакувані ресурси продаються від 16 шт., а нестакувані предмети — наборами x1, x3 або x6.
                    </div>
                    <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                      {resourceGroups.map((group) => (
                        <ResourceCard key={group.slug} group={group} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} categoryTitle={category.title} />
                    ))}
                  </div>
                )}
              </section>
            );
          })
        ) : (
          <div className="panel rounded-sm p-8 text-center">
            <Search className="mx-auto text-moss" size={42} />
            <h2 className="mt-4 text-2xl font-black text-white">Нічого не знайдено</h2>
            <p className="mt-3 text-fog/60">Спробуйте іншу назву, категорію або скиньте фільтри.</p>
          </div>
        )}
      </div>
    </>
  );
}
