import Image from "next/image";

type ItemIconProps = {
  kind: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizeClass = {
  xs: "h-5 w-5",
  sm: "h-10 w-10",
  md: "h-14 w-14",
  lg: "h-20 w-20",
  xl: "h-32 w-32"
};

const textureByKind: Record<string, string> = {
  armor: "iron_chestplate.png",
  beacon: "beacon.png",
  blocks: "cobblestone.png",
  bow: "bow.png",
  coal: "coal.png",
  cobblestone: "cobblestone.png",
  compass: "compass.png",
  diamond: "diamond.png",
  diamond_chestplate: "diamond_chestplate.png",
  diamond_sword: "diamond_sword.png",
  emerald: "emerald.png",
  ender_pearl: "ender_pearl.png",
  arrows: "arrow.png",
  arrow: "arrow.png",
  blaze_rod: "blaze_rod.png",
  bread: "bread.png",
  bucket: "bucket.png",
  book: "book.png",
  cobbled_deepslate: "cobbled_deepslate.png",
  cooked_beef: "cooked_beef.png",
  crafting_table: "crafting_table.png",
  crossbow: "crossbow.png",
  gold_ingot: "gold_ingot.png",
  golden_apple: "golden_apple.png",
  enchanted_golden_apple: "enchanted_golden_apple.png",
  diamond_axe: "diamond_axe.png",
  diamond_pickaxe: "diamond_pickaxe.png",
  diamond_shovel: "diamond_shovel.png",
  dirt: "dirt.png",
  experience_bottle: "experience_bottle.png",
  fishing_rod: "fishing_rod.png",
  flint_and_steel: "flint_and_steel.png",
  furnace: "furnace.png",
  glass: "glass.png",
  glowstone_dust: "glowstone_dust.png",
  gravel: "gravel.png",
  gunpowder: "gunpowder.png",
  iron_chestplate: "iron_chestplate.png",
  iron_axe: "iron_axe.png",
  iron_ingot: "iron_ingot.png",
  iron_pickaxe: "iron_pickaxe.png",
  iron_shovel: "iron_shovel.png",
  iron_sword: "iron_sword.png",
  ladder: "ladder.png",
  lapis_lazuli: "lapis_lazuli.png",
  lava_bucket: "lava_bucket.png",
  leather: "leather.png",
  milk_bucket: "milk_bucket.png",
  netherite_chestplate: "netherite_chestplate.png",
  netherite_ingot: "netherite_ingot.png",
  netherite_sword: "netherite_sword.png",
  netherrack: "netherrack.png",
  oak_planks: "oak_planks.png",
  oak_log: "oak_log.png",
  obsidian: "obsidian.png",
  paper: "paper.png",
  potion: "potion.png",
  quartz: "quartz.png",
  redstone: "redstone.png",
  sand: "sand.png",
  shield: "shield.png",
  shears: "shears.png",
  shulker: "shulker_box.png",
  shulker_box: "shulker_box.png",
  shulker_shell: "shulker_shell.png",
  slime_ball: "slime_ball.png",
  stone: "stone.png",
  stone_bricks: "stone_bricks.png",
  string: "string.png",
  sword: "diamond_sword.png",
  tnt: "tnt.png",
  totem: "totem_of_undying.png",
  totem_of_undying: "totem_of_undying.png",
  torch: "torch.png",
  trident: "trident.png",
  water_bucket: "water_bucket.png",
  wooden_axe: "wooden_axe.png"
};

const resourceKindBySlug: Record<string, string> = {
  diamonds: "diamond",
  emeralds: "emerald",
  "iron-ingots": "iron_ingot",
  "gold-ingots": "gold_ingot",
  redstone: "redstone",
  coal: "coal",
  "lapis-lazuli": "lapis_lazuli",
  quartz: "quartz",
  "glowstone-dust": "glowstone_dust",
  gunpowder: "gunpowder",
  string: "string",
  "slime-balls": "slime_ball",
  "blaze-rods": "blaze_rod",
  leather: "leather",
  paper: "paper",
  books: "book",
  "experience-bottles": "experience_bottle",
  cobblestone: "cobblestone",
  "oak-planks": "oak_planks",
  stone: "stone",
  dirt: "dirt",
  netherrack: "netherrack",
  "stone-bricks": "stone_bricks",
  "cobbled-deepslate": "cobbled_deepslate",
  sand: "sand",
  gravel: "gravel",
  "oak-logs": "oak_log",
  obsidian: "obsidian",
  glass: "glass",
  ladders: "ladder",
  torches: "torch",
  "crafting-tables": "crafting_table",
  furnaces: "furnace",
  tnt: "tnt",
  "netherite-ingots": "netherite_ingot",
  totems: "totem_of_undying",
  "ender-pearls": "ender_pearl",
  "golden-apples": "golden_apple",
  "enchanted-golden-apples": "enchanted_golden_apple",
  arrows: "arrow",
  shields: "shield",
  "cooked-beef": "cooked_beef",
  bread: "bread",
  "water-buckets": "water_bucket",
  "lava-buckets": "lava_bucket",
  "milk-buckets": "milk_bucket",
  "healing-potions": "potion",
  "swiftness-potions": "potion",
  "strength-potions": "potion",
  "regeneration-potions": "potion",
  "fire-resistance-potions": "potion",
  "regular-bows": "bow",
  crossbows: "crossbow",
  "iron-swords": "iron_sword",
  "regular-diamond-swords": "diamond_sword",
  "iron-pickaxes": "iron_pickaxe",
  "diamond-pickaxes": "diamond_pickaxe",
  "iron-axes": "iron_axe",
  "diamond-axes": "diamond_axe",
  "iron-shovels": "iron_shovel",
  "diamond-shovels": "diamond_shovel",
  shears: "shears",
  "flint-and-steel": "flint_and_steel",
  "fishing-rods": "fishing_rod",
  "shulker-shells": "shulker_shell",
  shulkers: "shulker_box",
  beacons: "beacon",
  tridents: "trident",
  bows: "bow",
  "diamond-swords": "diamond_sword",
  "netherite-swords": "netherite_sword",
  "diamond-chestplates": "diamond_chestplate",
  "netherite-chestplates": "netherite_chestplate",
  "admin-potions": "potion"
};

const productKindBySlug: Record<string, string> = {
  "builder-start": "cobblestone",
  "archer-start": "bow",
  "medic-start": "potion",
  "scout-start": "ender_pearl",
  "humans-guard-start": "shield",
  "humans-base-medic": "potion",
  "zombies-hunter-start": "ender_pearl",
  "zombies-fast-infector": "ender_pearl",
  "humans-wall-builder": "stone_bricks",
  "humans-emergency-base-cache": "shulker_box",
  "zombies-tunnel-breaker": "diamond_pickaxe",
  "zombies-swarm-cache": "ender_pearl",
  "humans-wall-warden": "bow",
  "humans-last-stand": "diamond_chestplate",
  "zombies-night-raider": "diamond_axe",
  "zombies-barricade-breaker": "tnt",
  "humans-god-fortress": "beacon",
  "humans-max-survival-set": "netherite_chestplate",
  "zombies-god-infector": "netherite_sword",
  "zombies-max-apocalypse-set": "netherite_sword",
  "miner-shulker": "diamond_pickaxe",
  "base-defense-shulker": "obsidian",
  "engineer-shulker": "redstone",
  "team-storage-shulker": "shulker_box",
  "portal-shulker": "obsidian",
  "raider-combat-kit": "diamond_sword",
  "tank-combat-kit": "diamond_chestplate",
  "sniper-combat-kit": "bow",
  "alchemist-combat-kit": "potion",
  "demolition-combat-kit": "tnt",
  "god-sword": "netherite_sword",
  "god-bow": "bow",
  "god-tank-kit": "netherite_chestplate",
  "god-ranger-kit": "bow",
  "god-engineer-kit": "redstone",
  "god-raider-kit": "netherite_sword",
  "full-god-kit": "netherite_chestplate",
  "humans-zombie-compass": "compass",
  "zombies-human-compass": "compass",
  "private-access": "wooden_axe"
};

function texturePath(kind: string): string {
  const file = textureByKind[kind] ?? textureByKind.shulker_box;
  return `/minecraft-items/${file}`;
}

export function itemKindFromProduct(product: { name: string; slug: string; category: string }): string {
  const value = `${product.slug} ${product.name}`.toLowerCase();
  const resourceSlug = product.slug.replace(/-x\d+$/, "");
  const resourceKind = resourceKindBySlug[resourceSlug];

  if (resourceKind) {
    return resourceKind;
  }

  const productKind = productKindBySlug[product.slug];
  if (productKind) {
    return productKind;
  }

  if (product.slug === "private-access" || value.includes("приват")) return "wooden_axe";
  if (value.includes("компас") || value.includes("compass")) return "compass";
  if (value.includes("зберіган") || value.includes("інвентар") || value.includes("inventory")) return "beacon";
  if (value.includes("друге життя") || value.includes("second-life")) return "totem_of_undying";
  if (product.slug === "full-god-kit" || value.includes("god kit") || value.includes("набір бога")) return "netherite_chestplate";
  if ((value.includes("незерит") || value.includes("netherite")) && (value.includes("меч") || value.includes("sword"))) return "netherite_sword";
  if ((value.includes("алмаз") || value.includes("diamond")) && (value.includes("меч") || value.includes("sword"))) return "diamond_sword";
  if ((value.includes("незерит") || value.includes("netherite")) && (value.includes("нагруд") || value.includes("chestplate"))) return "netherite_chestplate";
  if ((value.includes("алмаз") || value.includes("diamond")) && (value.includes("нагруд") || value.includes("chestplate"))) return "diamond_chestplate";
  if (value.includes("редсто") || value.includes("redstone")) return "redstone";
  if (value.includes("діам") || value.includes("diamond")) return "diamond";
  if (value.includes("смара") || value.includes("emerald")) return "emerald";
  if (value.includes("заліз") || value.includes("iron")) return "iron_ingot";
  if (value.includes("обсид") || value.includes("obsidian")) return "obsidian";
  if (value.includes("камін") || value.includes("stone")) return "stone";
  if (value.includes("скло") || value.includes("glass")) return "glass";
  if (value.includes("драбин") || value.includes("ladder")) return "ladder";
  if (value.includes("смолос") || value.includes("torch")) return "torch";
  if (value.includes("кругляк") || value.includes("бруків") || value.includes("cobblestone")) return "cobblestone";
  if (value.includes("дошк") || value.includes("planks")) return "oak_planks";
  if (value.includes("стріл") || value.includes("arrow")) return "arrow";
  if (value.includes("щит") || value.includes("shield")) return "shield";
  if (value.includes("ялович") || value.includes("beef")) return "cooked_beef";
  if (value.includes("хліб") || value.includes("bread")) return "bread";
  if (value.includes("яблу") || value.includes("apple")) return "golden_apple";
  if (value.includes("золот") || value.includes("gold")) return "gold_ingot";
  if (value.includes("вуг") || value.includes("coal")) return "coal";
  if (value.includes("незерит") || value.includes("netherite")) return "netherite_ingot";
  if (value.includes("тотем") || value.includes("totem")) return "totem_of_undying";
  if (value.includes("ендер") || value.includes("ender")) return "ender_pearl";
  if (value.includes("маяк") || value.includes("beacon")) return "beacon";
  if (value.includes("тризуб") || value.includes("trident")) return "trident";
  if (value.includes("панцир") || value.includes("shell")) return "shulker_shell";
  if (product.slug === "god-sword") return "netherite_sword";
  if (value.includes("лук") || value.includes("bow")) return "bow";
  if (value.includes("меч") || value.includes("sword")) return "diamond_sword";
  if (value.includes("брон") || value.includes("armor")) return "diamond_chestplate";
  if (value.includes("зілля") || value.includes("potion")) return "potion";
  if (value.includes("шалкер") || value.includes("shulker")) return "shulker_box";
  if (value.includes("будів") || value.includes("block")) return "cobblestone";

  if (product.category === "starter") return "iron_chestplate";
  if (product.category === "combat_shulkers") return "diamond_sword";
  if (product.category === "survival_shulkers") return "shulker_box";
  if (product.category === "gods") return "netherite_chestplate";
  if (product.category === "event_perks") return "beacon";
  if (product.category === "single_resources") return "diamond";

  return "shulker_box";
}

export function itemKindFromText(text: string, fallback = "shulker_box"): string {
  const value = text.toLowerCase();
  const has = (...needles: string[]) => needles.some((needle) => value.includes(needle));

  if (has("зачароване золоте яблу", "зачаровані золоті яблу", "enchanted golden apple", "enchanted_golden_apple")) return "enchanted_golden_apple";
  if (has("золоте яблу", "золоті яблу", "golden apple", "golden_apple")) return "golden_apple";
  if (has("адмінське зілля", "зілля", "potion")) return "potion";
  if (has("варена яловичина", "ялович", "cooked beef", "cooked_beef")) return "cooked_beef";
  if (has("хліб", "bread")) return "bread";

  if (has("відро води", "відра води", "water bucket", "water_bucket")) return "water_bucket";
  if (has("відро лави", "відра лави", "lava bucket", "lava_bucket")) return "lava_bucket";
  if (has("відро молока", "відра молока", "milk bucket", "milk_bucket")) return "milk_bucket";

  if (has("тризуб", "trident")) return "trident";
  if (has("арбалет", "crossbow")) return "crossbow";
  if (has("стріл", "arrow")) return "arrow";
  if (has("щит", "shield")) return "shield";
  if (has("лук", "bow")) return "bow";
  if (has("меч", "sword")) {
    if (has("незерит", "netherite")) return "netherite_sword";
    if (has("заліз", "iron")) return "iron_sword";
    return "diamond_sword";
  }
  if (has("сокир", "axe")) {
    if (has("заліз", "iron")) return "iron_axe";
    return "diamond_axe";
  }
  if (has("кирк", "pickaxe")) {
    if (has("алмаз", "diamond")) return "diamond_pickaxe";
    return "iron_pickaxe";
  }
  if (has("лопат", "shovel")) {
    if (has("алмаз", "diamond")) return "diamond_shovel";
    return "iron_shovel";
  }
  if (has("ножиц", "shears")) return "shears";
  if (has("запальнич", "flint and steel", "flint_and_steel")) return "flint_and_steel";
  if (has("вудк", "fishing rod", "fishing_rod")) return "fishing_rod";

  if (has("брон", "сет", "нагруд", "шолом", "понож", "чобот", "armor", "chestplate")) {
    if (has("незерит", "netherite")) return "netherite_chestplate";
    if (has("алмаз", "diamond")) return "diamond_chestplate";
    return "iron_chestplate";
  }

  if (has("тотем", "totem", "друге життя", "повернення зомбі")) return "totem_of_undying";
  if (has("ендер-перл", "ендер перл", "ender pearl", "ender_pearl")) return "ender_pearl";
  if (has("компас", "compass")) return "compass";
  if (has("маяк", "beacon")) return "beacon";
  if (has("шалкер", "shulker")) return "shulker_box";
  if (has("панцир", "shell")) return "shulker_shell";

  if (has("незеритові злитки", "незеритовий злиток", "netherite ingot", "netherite_ingot")) return "netherite_ingot";
  if (has("залізні злитки", "залізний злиток", "iron ingot", "iron_ingot")) return "iron_ingot";
  if (has("золоті злитки", "золотий злиток", "gold ingot", "gold_ingot")) return "gold_ingot";
  if (has("діамант", "алмаз", "diamond")) return "diamond";
  if (has("смарагд", "emerald")) return "emerald";
  if (has("редстоун", "порш", "повторювач", "redstone", "piston", "repeater")) return "redstone";
  if (has("вугіл", "coal")) return "coal";
  if (has("кварц", "quartz")) return "quartz";
  if (has("книг", "book")) return "book";
  if (has("папір", "paper")) return "paper";

  if (has("тнт", "tnt")) return "tnt";
  if (has("обсидіан", "obsidian")) return "obsidian";
  if (has("глибинна бруківка", "cobbled deepslate", "cobbled_deepslate")) return "cobbled_deepslate";
  if (has("кам'яна цегла", "кам’яна цегла", "stone bricks", "stone_bricks")) return "stone_bricks";
  if (has("кругляк", "бруків", "cobblestone")) return "cobblestone";
  if (has("камінь", "stone")) return "stone";
  if (has("дубові дошки", "дошк", "oak planks", "oak_planks", "planks")) return "oak_planks";
  if (has("скло", "glass")) return "glass";
  if (has("смолоскип", "torch")) return "torch";
  if (has("драбин", "ladder")) return "ladder";
  if (has("незерак", "netherrack")) return "netherrack";
  if (has("блоки для будівництва", "блоки для позицій", "building blocks")) return "cobblestone";

  if (has("приват", "клейм", "private", "claim")) return "wooden_axe";
  if (has("збереження інвентарю", "інвентар", "inventory")) return "beacon";

  return fallback;
}

export function ItemIcon({ kind, size = "md", className = "" }: ItemIconProps) {
  return (
    <span className={`mc-item-icon ${sizeClass[size]} ${className}`} aria-hidden="true">
      <Image
        src={texturePath(kind)}
        alt=""
        width={128}
        height={128}
        unoptimized
        draggable={false}
        className="mc-item-sprite"
      />
    </span>
  );
}
