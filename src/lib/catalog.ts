import { formatTalers } from "@/lib/currency";

export const categoryMeta = [
  {
    id: "starter",
    title: "Базові набори",
    description: "Стартові набори для всіх гравців із бронею, зброєю, їжею, блоками й базовими ресурсами."
  },
  {
    id: "survival_shulkers",
    title: "Набори виживання",
    description: "Комплекти з ресурсами для укріплень, їжі, світла, інструментів і довшого виживання."
  },
  {
    id: "combat_shulkers",
    title: "Бойові набори",
    description: "Бойові комплекти для активної гри під час хвиль зараження й захисту бази."
  },
  {
    id: "gods",
    title: "Суперпредмети",
    description: "Золоті преміум-набори з адмін-чарами, survival-неможливими комбінаціями й вищою ціною в талерах."
  },
  {
    id: "event_perks",
    title: "Івент-послуги",
    description: "Спеціальні покупки для всього івенту: збереження інвентарю, друге життя, доступ до приватів й інші ручні позначки адміністратора."
  },
  {
    id: "single_resources",
    title: "Ресурси",
    description: "Корисні ресурси окремими позиціями: стакувані продаються від 16 шт., а нестакувані предмети — наборами x1, x3 або x6."
  }
] as const;

export const teamLabels: Record<string, string> = {
  humans: "люди",
  zombies: "зомбі",
  all: "усі гравці"
};

export const categoryLabels: Record<string, string> = Object.fromEntries(
  categoryMeta.map((category) => [category.id, category.title])
);

export type ProductSnapshot = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  team: string;
  itemsCommands: string[];
};

export function parseCommands(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

export function parseTextList(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/^[-*]\s*/, ""))
      .filter(Boolean);
  }

  return [];
}

export function toProductSnapshot(product: {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  team: string;
  itemsCommands: string;
}): ProductSnapshot {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    category: product.category,
    team: product.team,
    itemsCommands: parseCommands(product.itemsCommands)
  };
}

export function parseOrderProducts(value: string | null | undefined): ProductSnapshot[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is ProductSnapshot => {
      return (
        item &&
        typeof item === "object" &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        Array.isArray(item.itemsCommands)
      );
    });
  } catch {
    return [];
  }
}

export function formatPrice(amount: number): string {
  return formatTalers(amount);
}

export function commandForNickname(command: string, nickname: string): string {
  return command.replaceAll("{nickname}", nickname);
}

export function slugify(value: string): string {
  const map: Record<string, string> = {
    а: "a",
    б: "b",
    в: "v",
    г: "h",
    ґ: "g",
    д: "d",
    е: "e",
    є: "ye",
    ж: "zh",
    з: "z",
    и: "y",
    і: "i",
    ї: "yi",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ь: "",
    ю: "yu",
    я: "ya"
  };

  const transliterated = value
    .toLowerCase()
    .split("")
    .map((letter) => map[letter] ?? letter)
    .join("");

  return transliterated
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 72);
}
