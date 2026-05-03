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
  if (value.includes("бруків") || value.includes("cobblestone")) return "cobblestone";
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
