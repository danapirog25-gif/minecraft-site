import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type SeedProduct = {
  name: string;
  slug: string;
  description: string;
  price: number;
  category: "starter" | "survival_shulkers" | "combat_shulkers" | "gods" | "single_resources" | "event_perks";
  team: "all" | "humans" | "zombies";
  contents: string[];
  benefits: string[];
  itemsCommands: string[];
};

type ResourceDefinition = {
  name: string;
  slug: string;
  item: string;
  prices: readonly [number, number, number];
  counts?: readonly [number, number, number];
  commandNbt?: string;
  description?: string;
  contentsLabel?: string;
  benefits?: string[];
};

const protection = [
  { id: "minecraft:protection", lvl: "3s" },
  { id: "minecraft:unbreaking", lvl: "2s" }
];

const strongProtection = [
  { id: "minecraft:protection", lvl: "4s" },
  { id: "minecraft:unbreaking", lvl: "3s" }
];

function enchantments(items: { id: string; lvl: string }[]): string {
  return `{Enchantments:[${items.map((item) => `{id:"${item.id}",lvl:${item.lvl}}`).join(",")}]}`;
}

function give(item: string, count = 1, nbt = ""): string {
  return `/give {nickname} minecraft:${item}${nbt} ${count}`;
}

function ironArmorSet(): string[] {
  const nbt = enchantments(protection);
  return [
    give("iron_helmet", 1, nbt),
    give("iron_chestplate", 1, nbt),
    give("iron_leggings", 1, nbt),
    give("iron_boots", 1, nbt)
  ];
}

function diamondArmorSet(): string[] {
  const nbt = enchantments(strongProtection);
  return [
    give("diamond_helmet", 1, nbt),
    give("diamond_chestplate", 1, nbt),
    give("diamond_leggings", 1, nbt),
    give("diamond_boots", 1, nbt)
  ];
}

function netheriteArmorSet(): string[] {
  const nbt = enchantments([
    { id: "minecraft:protection", lvl: "5s" },
    { id: "minecraft:unbreaking", lvl: "4s" },
    { id: "minecraft:mending", lvl: "1s" }
  ]);
  return [
    give("netherite_helmet", 1, nbt),
    give("netherite_chestplate", 1, nbt),
    give("netherite_leggings", 1, nbt),
    give("netherite_boots", 1, nbt)
  ];
}

function adminDiamondArmorSet(): string[] {
  return [
    give("diamond_helmet", 1, adminChestplateNbt),
    give("diamond_chestplate", 1, adminChestplateNbt),
    give("diamond_leggings", 1, adminChestplateNbt),
    give("diamond_boots", 1, adminChestplateNbt)
  ];
}

function adminNetheriteArmorSet(): string[] {
  return [
    give("netherite_helmet", 1, adminNetheriteArmorNbt),
    give("netherite_chestplate", 1, adminNetheriteArmorNbt),
    give("netherite_leggings", 1, adminNetheriteArmorNbt),
    give("netherite_boots", 1, adminNetheriteArmorNbt)
  ];
}

const ironSword = give("iron_sword", 1, enchantments([{ id: "minecraft:sharpness", lvl: "2s" }, { id: "minecraft:unbreaking", lvl: "2s" }]));
const ironAxe = give("iron_axe", 1, enchantments([{ id: "minecraft:sharpness", lvl: "2s" }, { id: "minecraft:unbreaking", lvl: "2s" }]));
const diamondSword = give("diamond_sword", 1, enchantments([{ id: "minecraft:sharpness", lvl: "4s" }, { id: "minecraft:unbreaking", lvl: "3s" }]));
const diamondAxe = give("diamond_axe", 1, enchantments([{ id: "minecraft:sharpness", lvl: "4s" }, { id: "minecraft:efficiency", lvl: "3s" }, { id: "minecraft:unbreaking", lvl: "3s" }]));
const netheriteSword = give("netherite_sword", 1, enchantments([{ id: "minecraft:sharpness", lvl: "5s" }, { id: "minecraft:fire_aspect", lvl: "2s" }, { id: "minecraft:unbreaking", lvl: "4s" }, { id: "minecraft:mending", lvl: "1s" }]));
const netheriteAxe = give("netherite_axe", 1, enchantments([{ id: "minecraft:sharpness", lvl: "5s" }, { id: "minecraft:efficiency", lvl: "4s" }, { id: "minecraft:unbreaking", lvl: "4s" }, { id: "minecraft:mending", lvl: "1s" }]));
const bow = give("bow", 1, enchantments([{ id: "minecraft:power", lvl: "3s" }, { id: "minecraft:unbreaking", lvl: "2s" }]));
const godBow = give("bow", 1, enchantments([{ id: "minecraft:power", lvl: "5s" }, { id: "minecraft:punch", lvl: "2s" }, { id: "minecraft:flame", lvl: "1s" }, { id: "minecraft:unbreaking", lvl: "4s" }, { id: "minecraft:mending", lvl: "1s" }]));

const adminGlow = enchantments([{ id: "minecraft:unbreaking", lvl: "10s" }]);
const adminTridentNbt = enchantments([
  { id: "minecraft:impaling", lvl: "8s" },
  { id: "minecraft:loyalty", lvl: "5s" },
  { id: "minecraft:riptide", lvl: "4s" },
  { id: "minecraft:channeling", lvl: "1s" },
  { id: "minecraft:unbreaking", lvl: "10s" },
  { id: "minecraft:mending", lvl: "1s" }
]);
const adminBowNbt = enchantments([
  { id: "minecraft:power", lvl: "8s" },
  { id: "minecraft:punch", lvl: "4s" },
  { id: "minecraft:flame", lvl: "1s" },
  { id: "minecraft:infinity", lvl: "1s" },
  { id: "minecraft:mending", lvl: "1s" },
  { id: "minecraft:unbreaking", lvl: "10s" }
]);
const adminDiamondSwordNbt = enchantments([
  { id: "minecraft:sharpness", lvl: "8s" },
  { id: "minecraft:looting", lvl: "5s" },
  { id: "minecraft:fire_aspect", lvl: "3s" },
  { id: "minecraft:knockback", lvl: "3s" },
  { id: "minecraft:sweeping_edge", lvl: "5s" },
  { id: "minecraft:unbreaking", lvl: "10s" },
  { id: "minecraft:mending", lvl: "1s" }
]);
const adminNetheriteSwordNbt = enchantments([
  { id: "minecraft:sharpness", lvl: "10s" },
  { id: "minecraft:looting", lvl: "7s" },
  { id: "minecraft:fire_aspect", lvl: "4s" },
  { id: "minecraft:knockback", lvl: "4s" },
  { id: "minecraft:sweeping_edge", lvl: "6s" },
  { id: "minecraft:unbreaking", lvl: "12s" },
  { id: "minecraft:mending", lvl: "1s" }
]);
const adminChestplateNbt = enchantments([
  { id: "minecraft:protection", lvl: "8s" },
  { id: "minecraft:fire_protection", lvl: "8s" },
  { id: "minecraft:blast_protection", lvl: "8s" },
  { id: "minecraft:projectile_protection", lvl: "8s" },
  { id: "minecraft:thorns", lvl: "5s" },
  { id: "minecraft:unbreaking", lvl: "10s" },
  { id: "minecraft:mending", lvl: "1s" }
]);
const adminNetheriteArmorNbt = enchantments([
  { id: "minecraft:protection", lvl: "10s" },
  { id: "minecraft:fire_protection", lvl: "10s" },
  { id: "minecraft:blast_protection", lvl: "10s" },
  { id: "minecraft:projectile_protection", lvl: "10s" },
  { id: "minecraft:thorns", lvl: "6s" },
  { id: "minecraft:unbreaking", lvl: "12s" },
  { id: "minecraft:mending", lvl: "1s" }
]);

const adminDiamondSword = give("diamond_sword", 1, adminDiamondSwordNbt);
const adminDiamondAxe = give("diamond_axe", 1, enchantments([
  { id: "minecraft:sharpness", lvl: "8s" },
  { id: "minecraft:efficiency", lvl: "7s" },
  { id: "minecraft:fortune", lvl: "4s" },
  { id: "minecraft:unbreaking", lvl: "10s" },
  { id: "minecraft:mending", lvl: "1s" }
]));
const adminNetheriteSword = give("netherite_sword", 1, adminNetheriteSwordNbt);
const adminNetheriteAxe = give("netherite_axe", 1, enchantments([
  { id: "minecraft:sharpness", lvl: "10s" },
  { id: "minecraft:efficiency", lvl: "8s" },
  { id: "minecraft:fortune", lvl: "5s" },
  { id: "minecraft:unbreaking", lvl: "12s" },
  { id: "minecraft:mending", lvl: "1s" }
]));
const adminBow = give("bow", 1, adminBowNbt);
const adminAllEffectsPotionNbt = `{CustomPotionColor:16766720,display:{Name:'{"text":"Адмінське зілля всіх бафів","color":"gold","italic":false}'},CustomPotionEffects:[{Id:1b,Amplifier:4b,Duration:12000},{Id:3b,Amplifier:4b,Duration:12000},{Id:5b,Amplifier:4b,Duration:12000},{Id:6b,Amplifier:4b,Duration:1},{Id:8b,Amplifier:4b,Duration:12000},{Id:10b,Amplifier:4b,Duration:12000},{Id:11b,Amplifier:4b,Duration:12000},{Id:12b,Amplifier:0b,Duration:12000},{Id:13b,Amplifier:0b,Duration:12000},{Id:16b,Amplifier:0b,Duration:12000},{Id:21b,Amplifier:4b,Duration:12000},{Id:22b,Amplifier:4b,Duration:12000},{Id:23b,Amplifier:4b,Duration:1200},{Id:26b,Amplifier:4b,Duration:12000},{Id:28b,Amplifier:0b,Duration:12000},{Id:29b,Amplifier:0b,Duration:12000},{Id:30b,Amplifier:0b,Duration:12000},{Id:32b,Amplifier:4b,Duration:12000}]}`;

function trackingCompassNbt(name: string, color: string, target: string): string {
  return `{display:{Name:'{"text":"${name}","color":"${color}","italic":false}',Lore:['{"text":"Показує напрямок до цілі: ${target}.","color":"gray","italic":false}','{"text":"Працює через серверний плагін або адмінську систему.","color":"dark_gray","italic":false}']},Enchantments:[{id:"minecraft:unbreaking",lvl:1s}],HideFlags:1}`;
}

const humansZombieCompass = give("compass", 1, trackingCompassNbt("Компас на зомбі", "red", "найближчого зомбі"));
const zombiesHumanCompass = give("compass", 1, trackingCompassNbt("Компас на людей", "green", "найближчу людину"));

const basicBlocks = [give("cobblestone", 64), give("oak_planks", 64), give("torch", 32)];
const survivalBlocks = [
  give("cobblestone", 128),
  give("oak_planks", 128),
  give("torch", 64),
  give("glass", 64),
  give("ladder", 64),
  give("water_bucket", 1),
  give("iron_pickaxe", 1),
  give("iron_axe", 1)
];
const potions = [
  give("potion", 4, `{Potion:"minecraft:healing"}`),
  give("potion", 2, `{Potion:"minecraft:swiftness"}`)
];
const strongPotions = [
  give("potion", 3, `{Potion:"minecraft:strength"}`),
  give("potion", 3, `{Potion:"minecraft:swiftness"}`),
  give("potion", 3, `{Potion:"minecraft:regeneration"}`)
];

const stackableResourceCounts = [16, 32, 64] as const;
const nonStackableResourceCounts = [1, 3, 6] as const;

const resourceDefinitions: ResourceDefinition[] = [
  { name: "Алмази", slug: "diamonds", item: "diamond", prices: [10, 20, 35] },
  { name: "Смарагди", slug: "emeralds", item: "emerald", prices: [8, 16, 30] },
  { name: "Залізні злитки", slug: "iron-ingots", item: "iron_ingot", prices: [5, 8, 14] },
  { name: "Золоті злитки", slug: "gold-ingots", item: "gold_ingot", prices: [6, 12, 22] },
  { name: "Редстоун", slug: "redstone", item: "redstone", prices: [5, 8, 12] },
  { name: "Вугілля", slug: "coal", item: "coal", prices: [5, 7, 10] },
  { name: "Лазурит", slug: "lapis-lazuli", item: "lapis_lazuli", prices: [6, 10, 18] },
  { name: "Кварц", slug: "quartz", item: "quartz", prices: [7, 12, 22] },
  { name: "Світлопил", slug: "glowstone-dust", item: "glowstone_dust", prices: [8, 14, 24] },
  { name: "Порох", slug: "gunpowder", item: "gunpowder", prices: [10, 18, 32] },
  { name: "Нитки", slug: "string", item: "string", prices: [6, 10, 18] },
  { name: "Слизові кульки", slug: "slime-balls", item: "slime_ball", prices: [10, 18, 32] },
  { name: "Вогняні стрижні", slug: "blaze-rods", item: "blaze_rod", prices: [14, 26, 46] },
  { name: "Шкіра", slug: "leather", item: "leather", prices: [5, 9, 16] },
  { name: "Папір", slug: "paper", item: "paper", prices: [4, 7, 12] },
  { name: "Книги", slug: "books", item: "book", prices: [8, 14, 24] },
  {
    name: "Пляшечки досвіду",
    slug: "experience-bottles",
    item: "experience_bottle",
    prices: [20, 38, 70],
    description: "Пляшечки досвіду для швидкого ремонту речей із Mending або підготовки перед боєм.",
    benefits: ["Дорожчі за звичайні матеріали, бо економлять час на фармі.", "Корисні перед фінальними хвилями івенту."]
  },
  { name: "Бруківка", slug: "cobblestone", item: "cobblestone", prices: [5, 7, 10] },
  { name: "Дубові дошки", slug: "oak-planks", item: "oak_planks", prices: [5, 7, 10] },
  { name: "Камінь", slug: "stone", item: "stone", prices: [5, 7, 10] },
  { name: "Земля", slug: "dirt", item: "dirt", prices: [3, 5, 8] },
  { name: "Незерак", slug: "netherrack", item: "netherrack", prices: [3, 5, 8] },
  { name: "Кам'яна цегла", slug: "stone-bricks", item: "stone_bricks", prices: [6, 10, 16] },
  { name: "Глибинна бруківка", slug: "cobbled-deepslate", item: "cobbled_deepslate", prices: [5, 8, 14] },
  { name: "Пісок", slug: "sand", item: "sand", prices: [4, 7, 12] },
  { name: "Гравій", slug: "gravel", item: "gravel", prices: [4, 7, 12] },
  { name: "Дубові колоди", slug: "oak-logs", item: "oak_log", prices: [8, 14, 24] },
  {
    name: "Обсидіан",
    slug: "obsidian",
    item: "obsidian",
    prices: [12, 22, 38],
    description: "Міцні блоки для укріплень, порталів і безпечних точок під час івенту.",
    benefits: ["Дорожчий за звичайні блоки, бо сильно підсилює оборону.", "Добре підходить для фінальних хвиль і захищених проходів."]
  },
  { name: "Скло", slug: "glass", item: "glass", prices: [5, 8, 14] },
  { name: "Драбини", slug: "ladders", item: "ladder", prices: [5, 8, 14] },
  { name: "Смолоскипи", slug: "torches", item: "torch", prices: [4, 7, 12] },
  { name: "Верстаки", slug: "crafting-tables", item: "crafting_table", prices: [4, 7, 12] },
  { name: "Печі", slug: "furnaces", item: "furnace", prices: [4, 7, 12] },
  {
    name: "ТНТ",
    slug: "tnt",
    item: "tnt",
    prices: [20, 38, 70],
    description: "ТНТ для контрольованих рейдів, пасток і швидкого прориву. Використання має відповідати правилам івенту.",
    benefits: ["Сильний інструмент атаки, тому коштує помітно дорожче за блоки.", "Підходить для командних штурмів і пасток."]
  },
  { name: "Незеритові злитки", slug: "netherite-ingots", item: "netherite_ingot", prices: [20, 35, 50] },
  {
    name: "Тотеми безсмертя",
    slug: "totems",
    item: "totem_of_undying",
    counts: nonStackableResourceCounts,
    prices: [45, 85, 150],
    contentsLabel: "Тотем безсмертя",
    description: "Тотем безсмертя для ризикових моментів і фінальних хвиль. Дешевший варіант підтримки без адмінського гліту.",
    benefits: ["Дає шанс пережити фатальний удар.", "Добре працює для обох сторін івенту."]
  },
  { name: "Ендер-перли", slug: "ender-pearls", item: "ender_pearl", prices: [8, 16, 28] },
  { name: "Золоті яблука", slug: "golden-apples", item: "golden_apple", prices: [15, 30, 50] },
  { name: "Стріли", slug: "arrows", item: "arrow", prices: [5, 9, 16] },
  {
    name: "Зачаровані золоті яблука",
    slug: "enchanted-golden-apples",
    item: "enchanted_golden_apple",
    counts: nonStackableResourceCounts,
    prices: [70, 180, 330],
    contentsLabel: "Зачароване золоте яблуко",
    description: "Рідкісні яблука для найнебезпечніших моментів. Дуже сильний survival-предмет, тому ціна висока.",
    benefits: ["Дає потужний запас виживання без адмін-чарів.", "Краще лишати для фінальних хвиль або рейдів."]
  },
  {
    name: "Щити",
    slug: "shields",
    item: "shield",
    counts: nonStackableResourceCounts,
    prices: [12, 32, 58],
    contentsLabel: "Щит",
    description: "Запасні щити для оборони бази, рейдів і довгих сутичок.",
    benefits: ["Недорогий захист без адмінських переваг.", "Корисно купувати командою перед активною фазою."]
  },
  { name: "Варена яловичина", slug: "cooked-beef", item: "cooked_beef", prices: [5, 9, 16] },
  { name: "Хліб", slug: "bread", item: "bread", prices: [4, 7, 12] },
  {
    name: "Відра води",
    slug: "water-buckets",
    item: "water_bucket",
    counts: nonStackableResourceCounts,
    prices: [12, 30, 55],
    contentsLabel: "Відро води",
    description: "Вода для сейву від падіння, гасіння вогню, проходів і швидких оборонних рішень.",
    benefits: ["Дуже корисна утиліті-річ без прямої бойової сили.", "Працює для будівництва, втечі й захисту."]
  },
  {
    name: "Відра лави",
    slug: "lava-buckets",
    item: "lava_bucket",
    counts: nonStackableResourceCounts,
    prices: [16, 40, 72],
    contentsLabel: "Відро лави",
    description: "Лава для пасток, контролю проходів і ризикових PvP-моментів. Використання має відповідати правилам.",
    benefits: ["Сильніше за воду в бою, тому коштує дорожче.", "Підходить для оборони бази та зонування."]
  },
  {
    name: "Відра молока",
    slug: "milk-buckets",
    item: "milk_bucket",
    counts: nonStackableResourceCounts,
    prices: [14, 36, 66],
    contentsLabel: "Відро молока",
    description: "Молоко для зняття небажаних ефектів після зілля, мобів або пасток.",
    benefits: ["Допомагає пережити негативні ефекти.", "Корисне для гравців, які часто йдуть у бій."]
  },
  {
    name: "Зілля лікування",
    slug: "healing-potions",
    item: "potion",
    counts: nonStackableResourceCounts,
    prices: [18, 48, 90],
    commandNbt: `{Potion:"minecraft:healing"}`,
    contentsLabel: "Зілля миттєвого лікування",
    description: "Звичайні survival-зілля лікування без адмінських ефектів. Корисні в бою, але не ламають баланс.",
    benefits: ["Сильніше за їжу в критичний момент.", "Ціна вища за яблука, бо ефект миттєвий."]
  },
  {
    name: "Зілля швидкості",
    slug: "swiftness-potions",
    item: "potion",
    counts: nonStackableResourceCounts,
    prices: [16, 44, 82],
    commandNbt: `{Potion:"minecraft:swiftness"}`,
    contentsLabel: "Зілля швидкості",
    description: "Звичайні зілля швидкості для втечі, переслідування або швидкого добігання до бази.",
    benefits: ["Дає мобільність без прямого адмінського урону.", "Добрий вибір для розвідки й атак хвилями."]
  },
  {
    name: "Зілля сили",
    slug: "strength-potions",
    item: "potion",
    counts: nonStackableResourceCounts,
    prices: [24, 65, 120],
    commandNbt: `{Potion:"minecraft:strength"}`,
    contentsLabel: "Зілля сили",
    description: "Звичайні зілля сили для ближнього бою. Сильні, але без адмінських рівнів.",
    benefits: ["Відчутно підсилює атаку, тому дорожче за швидкість.", "Добре для штурму або оборони вузьких проходів."]
  },
  {
    name: "Зілля регенерації",
    slug: "regeneration-potions",
    item: "potion",
    counts: nonStackableResourceCounts,
    prices: [26, 70, 130],
    commandNbt: `{Potion:"minecraft:regeneration"}`,
    contentsLabel: "Зілля регенерації",
    description: "Звичайні зілля регенерації для довших сутичок і відновлення після рейду.",
    benefits: ["Стабільне виживання без миттєвого burst-ефекту.", "Дорожче за лікування, бо працює протягом часу."]
  },
  {
    name: "Зілля вогнестійкості",
    slug: "fire-resistance-potions",
    item: "potion",
    counts: nonStackableResourceCounts,
    prices: [18, 48, 90],
    commandNbt: `{Potion:"minecraft:fire_resistance"}`,
    contentsLabel: "Зілля вогнестійкості",
    description: "Зілля проти лави, вогню та небезпечних пасток під час атаки або втечі.",
    benefits: ["Ситуативне, але може врятувати весь рейд.", "Збалансоване дешевше за силу й регенерацію."]
  },
  {
    name: "Звичайні луки",
    slug: "regular-bows",
    item: "bow",
    counts: nonStackableResourceCounts,
    prices: [18, 48, 85],
    contentsLabel: "Звичайний лук",
    description: "Звичайні луки без адмін-чарів для базової дистанційної гри.",
    benefits: ["Дешевша альтернатива бог-лукам.", "Потрібні разом зі стрілами для оборони бази."]
  },
  {
    name: "Арбалети",
    slug: "crossbows",
    item: "crossbow",
    counts: nonStackableResourceCounts,
    prices: [22, 58, 105],
    contentsLabel: "Арбалет",
    description: "Арбалети для контрольованих пострілів і засідок. Без адмінських чарів.",
    benefits: ["Повільніше за лук, але добре працює в засідках.", "Корисно для оборонців і штурмових груп."]
  },
  {
    name: "Залізні мечі",
    slug: "iron-swords",
    item: "iron_sword",
    counts: nonStackableResourceCounts,
    prices: [10, 27, 50],
    contentsLabel: "Залізний меч",
    description: "Звичайні залізні мечі для швидкого повернення в бій після смерті.",
    benefits: ["Дешево закриває базову потребу у зброї.", "Добре для командних запасів."]
  },
  {
    name: "Алмазні мечі",
    slug: "regular-diamond-swords",
    item: "diamond_sword",
    counts: nonStackableResourceCounts,
    prices: [35, 90, 160],
    contentsLabel: "Алмазний меч",
    description: "Звичайні алмазні мечі без адмін-чарів. Сильні, але чесні survival-предмети.",
    benefits: ["Помітно сильніше за залізо, тому коштує дорожче.", "Не плутати з мечами хаосу з Речей Бога."]
  },
  {
    name: "Залізні кирки",
    slug: "iron-pickaxes",
    item: "iron_pickaxe",
    counts: nonStackableResourceCounts,
    prices: [10, 27, 50],
    contentsLabel: "Залізна кирка",
    description: "Залізні кирки для швидкого видобутку, ремонту проходів і роботи з базою.",
    benefits: ["Корисні кожній команді як запас інструментів.", "Дешевше за алмазні інструменти."]
  },
  {
    name: "Алмазні кирки",
    slug: "diamond-pickaxes",
    item: "diamond_pickaxe",
    counts: nonStackableResourceCounts,
    prices: [34, 88, 155],
    contentsLabel: "Алмазна кирка",
    description: "Алмазні кирки для швидких робіт з міцними блоками й укріпленнями.",
    benefits: ["Кращий темп будівництва й демонтажу.", "Ціна близька до алмазного меча через цінність у рейдах."]
  },
  {
    name: "Залізні сокири",
    slug: "iron-axes",
    item: "iron_axe",
    counts: nonStackableResourceCounts,
    prices: [11, 30, 55],
    contentsLabel: "Залізна сокира",
    description: "Залізні сокири для дерева, щитів і ближніх сутичок.",
    benefits: ["Корисні як інструмент і запасна зброя.", "Трохи дорожче за меч через універсальність."]
  },
  {
    name: "Алмазні сокири",
    slug: "diamond-axes",
    item: "diamond_axe",
    counts: nonStackableResourceCounts,
    prices: [36, 94, 165],
    contentsLabel: "Алмазна сокира",
    description: "Алмазні сокири для дерева, штурму й розбору захисту.",
    benefits: ["Сильний універсальний предмет без адмінських чарів.", "Добре працює в руках активних гравців."]
  },
  {
    name: "Залізні лопати",
    slug: "iron-shovels",
    item: "iron_shovel",
    counts: nonStackableResourceCounts,
    prices: [8, 22, 40],
    contentsLabel: "Залізна лопата",
    description: "Лопати для траншей, піску, гравію й швидкого облаштування проходів.",
    benefits: ["Дешевий інструмент для будівельників.", "Корисно мати кілька в командному складі."]
  },
  {
    name: "Алмазні лопати",
    slug: "diamond-shovels",
    item: "diamond_shovel",
    counts: nonStackableResourceCounts,
    prices: [25, 65, 120],
    contentsLabel: "Алмазна лопата",
    description: "Алмазні лопати для швидких земляних робіт і оборонних траншей.",
    benefits: ["Дорожча, але значно зручніша за залізну.", "Підійде гравцям, які багато перебудовують базу."]
  },
  {
    name: "Ножиці",
    slug: "shears",
    item: "shears",
    counts: nonStackableResourceCounts,
    prices: [8, 20, 36],
    contentsLabel: "Ножиці",
    description: "Ножиці для павутини, листя й дрібних задач під час підготовки бази.",
    benefits: ["Нішевий, але дешевий інструмент.", "Корисно мати в запасі для швидкої зачистки."]
  },
  {
    name: "Запальнички",
    slug: "flint-and-steel",
    item: "flint_and_steel",
    counts: nonStackableResourceCounts,
    prices: [9, 24, 44],
    contentsLabel: "Запальничка",
    description: "Запальнички для порталів, пасток і контрольованого підпалу за правилами івенту.",
    benefits: ["Ситуативний інструмент з бойовим потенціалом.", "Дешевше за лаву й ТНТ."]
  },
  {
    name: "Вудки",
    slug: "fishing-rods",
    item: "fishing_rod",
    counts: nonStackableResourceCounts,
    prices: [8, 22, 40],
    contentsLabel: "Вудка",
    description: "Вудки для контролю дистанції, риболовлі або PvP-трюків.",
    benefits: ["Недорогий предмет для креативних гравців.", "Не дає прямої сили, але додає варіантів гри."]
  },
  { name: "Панцирі шалкера", slug: "shulker-shells", item: "shulker_shell", prices: [12, 24, 45] },
  {
    name: "Звичайні шалкери",
    slug: "shulkers",
    item: "shulker_box",
    counts: nonStackableResourceCounts,
    prices: [60, 120, 220],
    contentsLabel: "Звичайний шалкер",
    description: "Звичайні шалкери без адмін-чарів і гліту. Потрібні для зручного зберігання луту під час івенту.",
    benefits: ["Це звичайний survival-предмет без додаткових чарів.", "Зручно для ресурсів, рейдів і командного складу."]
  },
  { name: "Маяки", slug: "beacons", item: "beacon", prices: [25, 40, 50] },
  {
    name: "Штормові тризуби",
    slug: "tridents",
    item: "trident",
    counts: nonStackableResourceCounts,
    prices: [80, 160, 300],
    commandNbt: adminTridentNbt,
    contentsLabel: "Тризуб із Loyalty V, Riptide IV, Channeling та Impaling VIII",
    description: "Суперчарний тризуб із комбінацією чар, яку не зібрати у survival: Loyalty і Riptide разом плюс рівні вище ванільних.",
    benefits: ["Предмет виглядає як справжній івент-артефакт.", "Створений для моментів, коли треба здивувати гравців на стрімі."]
  },
  {
    name: "Луки рейду",
    slug: "bows",
    item: "bow",
    counts: nonStackableResourceCounts,
    prices: [60, 120, 220],
    commandNbt: adminBowNbt,
    contentsLabel: "Лук із Power VIII, Punch IV, Infinity та Mending",
    description: "Суперчарний лук із Infinity і Mending разом та рівнями, яких не буває у звичайному виживанні.",
    benefits: ["Для гравців, які хочуть відчути себе рейд-босом.", "Сильна дистанційна зброя з очевидним wow-ефектом."]
  },
  {
    name: "Алмазні мечі хаосу",
    slug: "diamond-swords",
    item: "diamond_sword",
    counts: nonStackableResourceCounts,
    prices: [80, 160, 300],
    commandNbt: adminDiamondSwordNbt,
    contentsLabel: "Алмазний меч із Sharpness VIII, Looting V та Unbreaking X",
    description: "Суперчарний алмазний меч із адмін-рівнями. У survival таку комбінацію й силу не отримати.",
    benefits: ["Зрозумілий преміум-предмет для PvP/PvE.", "Добре продає відчуття рідкісного луту."]
  },
  {
    name: "Незеритові мечі апокаліпсису",
    slug: "netherite-swords",
    item: "netherite_sword",
    counts: nonStackableResourceCounts,
    prices: [120, 240, 420],
    commandNbt: adminNetheriteSwordNbt,
    contentsLabel: "Незеритовий меч із Sharpness X, Looting VII та Unbreaking XII",
    description: "Адмінський незеритовий меч із чарами вище survival-лімітів. Це вже не просто меч, а бос-лут.",
    benefits: ["Найдорожчий одиночний клинок у супер-ресурсах.", "Підходить для фінальної хвилі або особливого раунду."]
  },
  {
    name: "Алмазні нагрудники титана",
    slug: "diamond-chestplates",
    item: "diamond_chestplate",
    counts: nonStackableResourceCounts,
    prices: [100, 200, 360],
    commandNbt: adminChestplateNbt,
    contentsLabel: "Алмазний нагрудник із Protection VIII, Thorns V та всіма типами захисту",
    description: "Суперчарний нагрудник із несумісними захистами в одному предметі. У survival такий сет не зробити.",
    benefits: ["Преміальна броня з очевидною перевагою.", "Гравець одразу бачить, що це не звичайний алмазний нагрудник."]
  },
  {
    name: "Незеритові нагрудники бога",
    slug: "netherite-chestplates",
    item: "netherite_chestplate",
    counts: nonStackableResourceCounts,
    prices: [150, 300, 520],
    commandNbt: adminNetheriteArmorNbt,
    contentsLabel: "Незеритовий нагрудник із Protection X, Thorns VI та всіма типами захисту",
    description: "Найдорожча одиночна броня серед ресурсів: незеритовий нагрудник із адмін-рівнями й несумісними захистами.",
    benefits: ["Дорожчий за алмазний варіант, бо дає кращу базову броню.", "Це речі Бога, не звичайний survival-предмет."]
  },
  {
    name: "Адмінські зілля всіх ефектів",
    slug: "admin-potions",
    item: "potion",
    counts: nonStackableResourceCounts,
    prices: [80, 150, 260],
    commandNbt: adminAllEffectsPotionNbt,
    contentsLabel: "Адмінське зілля з усіма позитивними ефектами",
    description: "Преміальне зілля з максимально посиленими позитивними ефектами: швидкість, сила, регенерація, захист, поглинання, нічний зір та інші бафи.",
    benefits: ["Дає коротке відчуття режиму боса.", "Підходить для фінального пушу або особливого моменту стріму."]
  }
];

function createResourceProducts(): SeedProduct[] {
  return resourceDefinitions.flatMap((resource) => {
    const counts = resource.counts ?? stackableResourceCounts;
    const isStackable = counts[0] >= 16;

    return counts.map((count, index) => ({
      name: `${resource.name} x${count}`,
      slug: `${resource.slug}-x${count}`,
      description: resource.description ?? `${resource.name} для івенту. ${
        isStackable ? "Мінімальне замовлення ресурсів — від 16 шт." : "Нестакувані предмети продаються наборами x1, x3 або x6."
      }`,
      price: resource.prices[index],
      category: "single_resources" as const,
      team: "all" as const,
      contents: [`${resource.contentsLabel ?? resource.name} — ${count} шт.`],
      benefits: resource.benefits ?? [
        "Купівля доступна 24/7.",
        "Видача після старту стріму та відкриття сервера."
      ],
      itemsCommands: [give(resource.item, count, resource.commandNbt ?? "")]
    }));
  });
}

const products: SeedProduct[] = [
  {
    name: "Малий старт",
    slug: "small-start",
    description: "Недорогий старт для будь-якої сторони: броня, меч, їжа, щит і перші блоки для виживання.",
    price: 50,
    category: "starter",
    team: "all",
    contents: [
      "Зачарований залізний шолом — 1 шт.",
      "Зачарований залізний нагрудник — 1 шт.",
      "Зачаровані залізні поножі — 1 шт.",
      "Зачаровані залізні чоботи — 1 шт.",
      "Залізний меч — 1 шт.",
      "Щит — 1 шт.",
      "Хліб — 32 шт.",
      "Камінь — 64 шт.",
      "Дубові дошки — 64 шт.",
      "Смолоскипи — 32 шт.",
      "Залізні злитки — 16 шт.",
      "Вугілля — 32 шт."
    ],
    benefits: ["Повний мінімальний комплект для старту.", "Підходить людям і зомбі без переваги для однієї сторони."],
    itemsCommands: [...ironArmorSet(), give("iron_sword"), give("shield"), give("bread", 32), ...basicBlocks, give("iron_ingot", 16), give("coal", 32)]
  },
  {
    name: "Старт виживальника",
    slug: "survivor-start",
    description: "Збалансований старт із луком, стрілами, бронею та ресурсами для першої оборони або атаки.",
    price: 70,
    category: "starter",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Зачарований залізний меч — 1 шт.",
      "Щит — 1 шт.",
      "Лук — 1 шт.",
      "Стріли — 64 шт.",
      "Варена яловичина — 32 шт.",
      "Камінь — 64 шт.",
      "Дубові дошки — 64 шт.",
      "Смолоскипи — 64 шт.",
      "Скло — 32 шт.",
      "Залізні злитки — 16 шт.",
      "Вугілля — 32 шт."
    ],
    benefits: ["Додає дистанційну гру й більше їжі.", "Зручний набір для більшості гравців під час стріму."],
    itemsCommands: [...ironArmorSet(), ironSword, give("shield"), give("bow"), give("arrow", 64), give("cooked_beef", 32), give("cobblestone", 64), give("oak_planks", 64), give("torch", 64), give("glass", 32), give("iron_ingot", 16), give("coal", 32)]
  },
  {
    name: "Базовий бойовий набір",
    slug: "basic-combat-kit",
    description: "Посилений базовий набір для активного PvP/PvE з мечем, сокирою, луком і запасом блоків.",
    price: 90,
    category: "starter",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Зачарований залізний меч — 1 шт.",
      "Зачарована залізна сокира — 1 шт.",
      "Щит — 1 шт.",
      "Лук — 1 шт.",
      "Стріли — 128 шт.",
      "Золоті яблука — 2 шт.",
      "Варена яловичина — 64 шт.",
      "Блоки для будівництва — 128 шт.",
      "Залізні злитки — 24 шт.",
      "Ендер-перли — 4 шт."
    ],
    benefits: ["Кращий бойовий старт без преміум-ціни.", "Є броня, зброя, їжа, блоки й яблука для ризикових моментів."],
    itemsCommands: [...ironArmorSet(), ironSword, ironAxe, give("shield"), give("bow"), give("arrow", 128), give("golden_apple", 2), give("cooked_beef", 64), give("cobblestone", 128), give("iron_ingot", 24), give("ender_pearl", 4)]
  },
  {
    name: "Старт будівельника",
    slug: "builder-start",
    description: "Дешевий старт для гравця, який одразу будує стіни, проходи й базові укриття.",
    price: 75,
    category: "starter",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Залізний меч — 1 шт.",
      "Залізна кирка — 1 шт.",
      "Залізна сокира — 1 шт.",
      "Бруківка — 192 шт.",
      "Дубові дошки — 128 шт.",
      "Скло — 64 шт.",
      "Смолоскипи — 96 шт.",
      "Варена яловичина — 32 шт."
    ],
    benefits: ["Для гравців, які хочуть допомогти команді базою з перших хвилин.", "Більше блоків, менше бойового перекосу."],
    itemsCommands: [...ironArmorSet(), give("iron_sword"), give("iron_pickaxe"), give("iron_axe"), give("cobblestone", 192), give("oak_planks", 128), give("glass", 64), give("torch", 96), give("cooked_beef", 32)]
  },
  {
    name: "Старт лучника",
    slug: "archer-start",
    description: "Старт для дистанційної гри: броня, лук, багато стріл і базові ресурси для позиції.",
    price: 85,
    category: "starter",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Залізний меч — 1 шт.",
      "Лук — 1 шт.",
      "Стріли — 192 шт.",
      "Щит — 1 шт.",
      "Золоті яблука — 2 шт.",
      "Ендер-перли — 2 шт.",
      "Дубові дошки — 96 шт.",
      "Варена яловичина — 48 шт."
    ],
    benefits: ["Добре для оборони стін і прикриття команди.", "Не дає надмірної сили, але додає стабільну дистанційну роль."],
    itemsCommands: [...ironArmorSet(), give("iron_sword"), give("bow"), give("arrow", 192), give("shield"), give("golden_apple", 2), give("ender_pearl", 2), give("oak_planks", 96), give("cooked_beef", 48)]
  },
  {
    name: "Старт медика",
    slug: "medic-start",
    description: "Підтримка для команди: їжа, щит, лікування, швидкість і достатньо блоків, щоб дожити до замісу.",
    price: 95,
    category: "starter",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Залізний меч — 1 шт.",
      "Щит — 1 шт.",
      "Зілля лікування — 3 шт.",
      "Зілля швидкості — 2 шт.",
      "Золоті яблука — 3 шт.",
      "Хліб — 64 шт.",
      "Варена яловичина — 32 шт.",
      "Смолоскипи — 64 шт."
    ],
    benefits: ["Підходить гравцям, які допомагають іншим виживати.", "Менше урону, більше сейву й підтримки."],
    itemsCommands: [...ironArmorSet(), give("iron_sword"), give("shield"), give("potion", 3, `{Potion:"minecraft:healing"}`), give("potion", 2, `{Potion:"minecraft:swiftness"}`), give("golden_apple", 3), give("bread", 64), give("cooked_beef", 32), give("torch", 64)]
  },
  {
    name: "Старт розвідника",
    slug: "scout-start",
    description: "Швидкий старт для розвідки, обходів і повернення на позицію після небезпечних моментів.",
    price: 100,
    category: "starter",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Залізний меч — 1 шт.",
      "Лук — 1 шт.",
      "Стріли — 64 шт.",
      "Ендер-перли — 6 шт.",
      "Зілля швидкості — 3 шт.",
      "Золоті яблука — 2 шт.",
      "Варена яловичина — 48 шт.",
      "Блоки для будівництва — 96 шт."
    ],
    benefits: ["Для гравців, які беруть інформацію й швидко рухаються картою.", "Сильний у мобільності, але не перетворює старт на преміум-сет."],
    itemsCommands: [...ironArmorSet(), give("iron_sword"), give("bow"), give("arrow", 64), give("ender_pearl", 6), give("potion", 3, `{Potion:"minecraft:swiftness"}`), give("golden_apple", 2), give("cooked_beef", 48), give("cobblestone", 96)]
  },
  {
    name: "Люди: старт охоронця",
    slug: "humans-guard-start",
    description: "Стартовий набір саме для людей: щит, лук, запас стріл і блоки для першої оборони бази.",
    price: 85,
    category: "starter",
    team: "humans",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Зачарований залізний меч — 1 шт.",
      "Щит — 2 шт.",
      "Лук — 1 шт.",
      "Стріли — 160 шт.",
      "Кам'яна цегла — 96 шт.",
      "Скло — 32 шт.",
      "Смолоскипи — 64 шт.",
      "Золоті яблука — 2 шт.",
      "Варена яловичина — 48 шт."
    ],
    benefits: ["Заточений під перші хвилини оборони людей.", "Дає більше щитів і матеріалів для укриття, але без преміум-зброї."],
    itemsCommands: [...ironArmorSet(), ironSword, give("shield", 2), give("bow"), give("arrow", 160), give("stone_bricks", 96), give("glass", 32), give("torch", 64), give("golden_apple", 2), give("cooked_beef", 48)]
  },
  {
    name: "Люди: медик бази",
    slug: "humans-base-medic",
    description: "Підтримка саме для команди людей: лікування, регенерація, їжа й запас для швидкого сейву союзників.",
    price: 115,
    category: "starter",
    team: "humans",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Залізний меч — 1 шт.",
      "Щит — 1 шт.",
      "Зілля лікування — 6 шт.",
      "Зілля регенерації — 3 шт.",
      "Зілля швидкості — 2 шт.",
      "Золоті яблука — 4 шт.",
      "Хліб — 96 шт.",
      "Варена яловичина — 48 шт.",
      "Смолоскипи — 64 шт."
    ],
    benefits: ["Для гравця, який тримається біля бази й рятує союзників.", "Більше підтримки, менше прямої шкоди."],
    itemsCommands: [...ironArmorSet(), give("iron_sword"), give("shield"), give("potion", 6, `{Potion:"minecraft:healing"}`), give("potion", 3, `{Potion:"minecraft:regeneration"}`), give("potion", 2, `{Potion:"minecraft:swiftness"}`), give("golden_apple", 4), give("bread", 96), give("cooked_beef", 48), give("torch", 64)]
  },
  {
    name: "Зомбі: старт мисливця",
    slug: "zombies-hunter-start",
    description: "Стартовий набір саме для зомбі: швидкість, перли, сокира й мінімум ресурсів для погоні за людьми.",
    price: 85,
    category: "starter",
    team: "zombies",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Зачарована залізна сокира — 1 шт.",
      "Залізний меч — 1 шт.",
      "Арбалет — 1 шт.",
      "Стріли — 96 шт.",
      "Ендер-перли — 5 шт.",
      "Зілля швидкості — 3 шт.",
      "Золоті яблука — 2 шт.",
      "Бруківка — 96 шт.",
      "Варена яловичина — 48 шт."
    ],
    benefits: ["Дає зомбі мобільність для раннього тиску.", "Сильний у погоні, але без важкої броні чи адмін-чарів."],
    itemsCommands: [...ironArmorSet(), ironAxe, give("iron_sword"), give("crossbow"), give("arrow", 96), give("ender_pearl", 5), give("potion", 3, `{Potion:"minecraft:swiftness"}`), give("golden_apple", 2), give("cobblestone", 96), give("cooked_beef", 48)]
  },
  {
    name: "Зомбі: швидкий заражувач",
    slug: "zombies-fast-infector",
    description: "Набір для зомбі, які грають від ривків і раптових заходів у тил людей.",
    price: 115,
    category: "starter",
    team: "zombies",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Зачарований залізний меч — 1 шт.",
      "Зачарована залізна сокира — 1 шт.",
      "Ендер-перли — 8 шт.",
      "Зілля швидкості — 5 шт.",
      "Зілля сили — 2 шт.",
      "Золоті яблука — 4 шт.",
      "Драбини — 64 шт.",
      "Бруківка — 128 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Для агресивної гри за зомбі й швидких вривів.", "Мобільність вища за звичайний старт, тому ціна теж вища."],
    itemsCommands: [...ironArmorSet(), ironSword, ironAxe, give("ender_pearl", 8), give("potion", 5, `{Potion:"minecraft:swiftness"}`), give("potion", 2, `{Potion:"minecraft:strength"}`), give("golden_apple", 4), give("ladder", 64), give("cobblestone", 128), give("cooked_beef", 64)]
  },
  {
    name: "Люди: будівельник стін",
    slug: "humans-wall-builder",
    description: "Великий набір саме для людей: швидко підняти стіни, поставити світло й закрити слабкі місця бази.",
    price: 155,
    category: "survival_shulkers",
    team: "humans",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Залізна кирка — 2 шт.",
      "Залізна сокира — 1 шт.",
      "Кам'яна цегла — 320 шт.",
      "Глибинна бруківка — 192 шт.",
      "Скло — 128 шт.",
      "Драбини — 96 шт.",
      "Смолоскипи — 192 шт.",
      "Відра води — 2 шт.",
      "Щити — 2 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Максимально корисний для людей, які тримають базу.", "Дає багато захисних блоків без рейдового ТНТ."],
    itemsCommands: [...ironArmorSet(), give("iron_pickaxe", 2), give("iron_axe"), give("stone_bricks", 320), give("cobbled_deepslate", 192), give("glass", 128), give("ladder", 96), give("torch", 192), give("water_bucket", 2), give("shield", 2), give("cooked_beef", 64)]
  },
  {
    name: "Люди: аварійний склад бази",
    slug: "humans-emergency-base-cache",
    description: "Командний survival-набір для людей: їжа, ремонтні ресурси, світло, щити й запас на довгу облогу.",
    price: 230,
    category: "survival_shulkers",
    team: "humans",
    contents: [
      "Шалкери — 2 шт.",
      "Кам'яна цегла — 384 шт.",
      "Обсидіан — 64 шт.",
      "Скло — 192 шт.",
      "Смолоскипи — 256 шт.",
      "Щити — 4 шт.",
      "Відра води — 3 шт.",
      "Залізні злитки — 96 шт.",
      "Вугілля — 96 шт.",
      "Хліб — 128 шт.",
      "Варена яловичина — 128 шт.",
      "Золоті яблука — 6 шт."
    ],
    benefits: ["Зроблений як командний запас людей для оборони.", "Має багато матеріалів і їжі, але не перетворює склад на god-набір."],
    itemsCommands: [give("shulker_box", 2), give("stone_bricks", 384), give("obsidian", 64), give("glass", 192), give("torch", 256), give("shield", 4), give("water_bucket", 3), give("iron_ingot", 96), give("coal", 96), give("bread", 128), give("cooked_beef", 128), give("golden_apple", 6)]
  },
  {
    name: "Зомбі: підкопник",
    slug: "zombies-tunnel-breaker",
    description: "Survival-набір саме для зомбі: кирки, лопати, драбини й ресурси для обходу оборони людей.",
    price: 150,
    category: "survival_shulkers",
    team: "zombies",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Алмазна кирка — 1 шт.",
      "Залізні кирки — 2 шт.",
      "Залізна лопата — 1 шт.",
      "Драбини — 128 шт.",
      "Смолоскипи — 160 шт.",
      "Незерак — 192 шт.",
      "Бруківка — 192 шт.",
      "Відро води — 1 шт.",
      "Ендер-перли — 4 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Корисний для підкопів і обходів, якщо правила це дозволяють.", "Дає утиліті зомбі без великого запасу ТНТ."],
    itemsCommands: [...ironArmorSet(), give("diamond_pickaxe"), give("iron_pickaxe", 2), give("iron_shovel"), give("ladder", 128), give("torch", 160), give("netherrack", 192), give("cobblestone", 192), give("water_bucket"), give("ender_pearl", 4), give("cooked_beef", 64)]
  },
  {
    name: "Зомбі: ройовий запас",
    slug: "zombies-swarm-cache",
    description: "Командний набір для хвилі зомбі: багато їжі, блоків, перлів і базових предметів для кількох атак.",
    price: 225,
    category: "survival_shulkers",
    team: "zombies",
    contents: [
      "Шалкери — 2 шт.",
      "Бруківка — 384 шт.",
      "Незерак — 384 шт.",
      "Драбини — 160 шт.",
      "Смолоскипи — 160 шт.",
      "Ендер-перли — 16 шт.",
      "Запальнички — 4 шт.",
      "Залізні злитки — 64 шт.",
      "Вугілля — 64 шт.",
      "Золоті яблука — 8 шт.",
      "Варена яловичина — 128 шт."
    ],
    benefits: ["Зручний запас для команди зомбі перед серією штурмів.", "Фокус на мобільність і логістику, а не на адмін-зброю."],
    itemsCommands: [give("shulker_box", 2), give("cobblestone", 384), give("netherrack", 384), give("ladder", 160), give("torch", 160), give("ender_pearl", 16), give("flint_and_steel", 4), give("iron_ingot", 64), give("coal", 64), give("golden_apple", 8), give("cooked_beef", 128)]
  },
  {
    name: "Люди: вартовий стіни",
    slug: "humans-wall-warden",
    description: "Бойовий набір для людей, які тримають висоту, ворота або вузький прохід під час атаки зомбі.",
    price: 185,
    category: "combat_shulkers",
    team: "humans",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Зачарований алмазний меч — 1 шт.",
      "Зачарований лук — 1 шт.",
      "Арбалет — 1 шт.",
      "Стріли — 256 шт.",
      "Щити — 2 шт.",
      "Золоті яблука — 8 шт.",
      "Зілля лікування — 4 шт.",
      "Зілля регенерації — 2 шт.",
      "Кам'яна цегла — 192 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Створений саме для оборонних позицій людей.", "Більше стріл і щитів, менше рейдових предметів."],
    itemsCommands: [...ironArmorSet(), diamondSword, bow, give("crossbow"), give("arrow", 256), give("shield", 2), give("golden_apple", 8), give("potion", 4, `{Potion:"minecraft:healing"}`), give("potion", 2, `{Potion:"minecraft:regeneration"}`), give("stone_bricks", 192), give("cooked_beef", 64)]
  },
  {
    name: "Люди: останній рубіж",
    slug: "humans-last-stand",
    description: "Дорогий бойовий набір для людей на фінальні хвилі: алмазна броня, тотем, яблука й захисні блоки.",
    price: 270,
    category: "combat_shulkers",
    team: "humans",
    contents: [
      "Зачарований алмазний сет броні — 1 комплект",
      "Зачарований алмазний меч — 1 шт.",
      "Зачарований лук — 1 шт.",
      "Стріли — 256 шт.",
      "Щити — 3 шт.",
      "Тотем безсмертя — 1 шт.",
      "Зачароване золоте яблуко — 1 шт.",
      "Золоті яблука — 14 шт.",
      "Зілля регенерації — 4 шт.",
      "Зілля лікування — 6 шт.",
      "Обсидіан — 64 шт.",
      "Кам'яна цегла — 192 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Для моментів, коли людям треба втримати останню точку.", "Сильний захист без survival-неможливих адмін-чарів."],
    itemsCommands: [...diamondArmorSet(), diamondSword, bow, give("arrow", 256), give("shield", 3), give("totem_of_undying"), give("enchanted_golden_apple"), give("golden_apple", 14), give("potion", 4, `{Potion:"minecraft:regeneration"}`), give("potion", 6, `{Potion:"minecraft:healing"}`), give("obsidian", 64), give("stone_bricks", 192), give("cooked_beef", 64)]
  },
  {
    name: "Зомбі: нічний рейдер",
    slug: "zombies-night-raider",
    description: "Бойовий набір для зомбі, які заходять у тил: перли, сокира, арбалет, ТНТ і швидкість.",
    price: 185,
    category: "combat_shulkers",
    team: "zombies",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Зачарований алмазний меч — 1 шт.",
      "Зачарована алмазна сокира — 1 шт.",
      "Арбалет — 1 шт.",
      "Стріли — 160 шт.",
      "Ендер-перли — 12 шт.",
      "Зілля швидкості — 4 шт.",
      "Зілля сили — 3 шт.",
      "ТНТ — 16 шт.",
      "Запальнички — 3 шт.",
      "Золоті яблука — 8 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Сильний для атак з флангу й добивання ізольованих людей.", "ТНТ обмежений, щоб набір не замінив повний штурмовий комплект."],
    itemsCommands: [...ironArmorSet(), diamondSword, diamondAxe, give("crossbow"), give("arrow", 160), give("ender_pearl", 12), give("potion", 4, `{Potion:"minecraft:swiftness"}`), give("potion", 3, `{Potion:"minecraft:strength"}`), give("tnt", 16), give("flint_and_steel", 3), give("golden_apple", 8), give("cooked_beef", 64)]
  },
  {
    name: "Зомбі: штурм барикад",
    slug: "zombies-barricade-breaker",
    description: "Важкий комплект зомбі для прориву барикад: алмазна броня, сокира, ТНТ, лава й запас яблук.",
    price: 255,
    category: "combat_shulkers",
    team: "zombies",
    contents: [
      "Зачарований алмазний сет броні — 1 комплект",
      "Зачарований алмазний меч — 1 шт.",
      "Зачарована алмазна сокира — 1 шт.",
      "Арбалет — 1 шт.",
      "Стріли — 160 шт.",
      "Ендер-перли — 14 шт.",
      "ТНТ — 32 шт.",
      "Відра лави — 3 шт.",
      "Запальнички — 4 шт.",
      "Золоті яблука — 14 шт.",
      "Зілля сили — 4 шт.",
      "Зілля швидкості — 4 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Максимально агресивний набір для зомбі без god-чарів.", "Дорожчий через ТНТ, лаву й алмазну броню."],
    itemsCommands: [...diamondArmorSet(), diamondSword, diamondAxe, give("crossbow"), give("arrow", 160), give("ender_pearl", 14), give("tnt", 32), give("lava_bucket", 3), give("flint_and_steel", 4), give("golden_apple", 14), give("potion", 4, `{Potion:"minecraft:strength"}`), give("potion", 4, `{Potion:"minecraft:swiftness"}`), give("cooked_beef", 64)]
  },
  {
    name: "Люди: Бог-Фортеця",
    slug: "humans-god-fortress",
    description: "God-набір саме для людей: адмін-броня, лук контролю, тотеми, маяк і ресурси для неприємно міцної оборони.",
    price: 460,
    category: "gods",
    team: "humans",
    contents: [
      "Алмазний сет з адмін-чарами: Protection VIII + усі типи захисту — 1 комплект",
      "Лук із адмін-чарами: Power VIII, Punch IV, Infinity + Mending — 1 шт.",
      "Алмазний меч хаосу: Sharpness VIII, Looting V, Unbreaking X — 1 шт.",
      "Стріли — 256 шт.",
      "Щити — 3 шт.",
      "Тотеми безсмертя — 2 шт.",
      "Зачароване золоте яблуко — 1 шт.",
      "Золоті яблука — 16 шт.",
      "Зілля регенерації — 4 шт.",
      "Зілля лікування — 6 шт.",
      "Обсидіан — 96 шт.",
      "Кам'яна цегла — 256 шт.",
      "Маяк — 1 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Окремий преміум-набір для людей, які тримають базу.", "Сильний у захисті й контролі дистанції, але без незеритового меча Sharpness X."],
    itemsCommands: [...adminDiamondArmorSet(), adminBow, adminDiamondSword, give("arrow", 256), give("shield", 3), give("totem_of_undying", 2), give("enchanted_golden_apple"), give("golden_apple", 16), give("potion", 4, `{Potion:"minecraft:regeneration"}`), give("potion", 6, `{Potion:"minecraft:healing"}`), give("obsidian", 96), give("stone_bricks", 256), give("beacon"), give("cooked_beef", 64)]
  },
  {
    name: "Люди: максимальний сет виживання",
    slug: "humans-max-survival-set",
    description: "Максимальний god-набір саме для людей: повний незеритовий адмін-захист, лук, тотеми, маяк і ресурси для останніх 100 днів.",
    price: 540,
    category: "gods",
    team: "humans",
    contents: [
      "Незеритовий сет з адмін-чарами: Protection X + усі типи захисту — 1 комплект",
      "Незеритовий меч апокаліпсису: Sharpness X, Looting VII — 1 шт.",
      "Лук рейду: Power VIII, Punch IV, Infinity + Mending — 1 шт.",
      "Щити — 3 шт.",
      "Стріли — 256 шт.",
      "Тотеми безсмертя — 3 шт.",
      "Зачаровані золоті яблука — 2 шт.",
      "Золоті яблука — 20 шт.",
      "Ендер-перли — 16 шт.",
      "Зілля регенерації — 5 шт.",
      "Зілля лікування — 8 шт.",
      "Зілля вогнестійкості — 4 шт.",
      "Обсидіан — 128 шт.",
      "Кам'яна цегла — 384 шт.",
      "Маяк — 1 шт.",
      "Варена яловичина — 128 шт."
    ],
    benefits: ["Найсильніший набір для людей у магазині.", "Побудований навколо виживання, оборони й довгого утримання бази."],
    itemsCommands: [...adminNetheriteArmorSet(), adminNetheriteSword, adminBow, give("shield", 3), give("arrow", 256), give("totem_of_undying", 3), give("enchanted_golden_apple", 2), give("golden_apple", 20), give("ender_pearl", 16), give("potion", 5, `{Potion:"minecraft:regeneration"}`), give("potion", 8, `{Potion:"minecraft:healing"}`), give("potion", 4, `{Potion:"minecraft:fire_resistance"}`), give("obsidian", 128), give("stone_bricks", 384), give("beacon"), give("cooked_beef", 128)]
  },
  {
    name: "Зомбі: Бог-Інфектор",
    slug: "zombies-god-infector",
    description: "God-набір саме для зомбі: адмін-зброя, швидкість, перли, ТНТ і все для вирішального прориву.",
    price: 460,
    category: "gods",
    team: "zombies",
    contents: [
      "Алмазний сет з адмін-чарами: Protection VIII + усі типи захисту — 1 комплект",
      "Незеритовий меч із адмін-чарами: Sharpness X, Looting VII, Fire Aspect IV — 1 шт.",
      "Незеритова сокира з адмін-чарами — 1 шт.",
      "Лук рейду: Power VIII, Punch IV, Infinity + Mending — 1 шт.",
      "Стріли — 160 шт.",
      "Ендер-перли — 20 шт.",
      "Тотем безсмертя — 1 шт.",
      "Зачароване золоте яблуко — 1 шт.",
      "Золоті яблука — 16 шт.",
      "Зілля сили — 5 шт.",
      "Зілля швидкості — 6 шт.",
      "ТНТ — 32 шт.",
      "Відра лави — 4 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Окремий преміум-набір для зомбі, які ведуть штурм.", "Сильний в атаці, але броня лишається алмазною, щоб не дублювати повний god-сет."],
    itemsCommands: [...adminDiamondArmorSet(), adminNetheriteSword, adminNetheriteAxe, adminBow, give("arrow", 160), give("ender_pearl", 20), give("totem_of_undying"), give("enchanted_golden_apple"), give("golden_apple", 16), give("potion", 5, `{Potion:"minecraft:strength"}`), give("potion", 6, `{Potion:"minecraft:swiftness"}`), give("tnt", 32), give("lava_bucket", 4), give("cooked_beef", 64)]
  },
  {
    name: "Зомбі: максимальний сет апокаліпсису",
    slug: "zombies-max-apocalypse-set",
    description: "Максимальний god-набір саме для зомбі: незеритовий адмін-сет, рейдова зброя, перли, ТНТ і тотеми для фінальної хвилі.",
    price: 540,
    category: "gods",
    team: "zombies",
    contents: [
      "Незеритовий сет з адмін-чарами: Protection X + усі типи захисту — 1 комплект",
      "Незеритовий меч апокаліпсису: Sharpness X, Looting VII — 1 шт.",
      "Незеритова сокира з Efficiency VIII, Sharpness X, Fortune V — 1 шт.",
      "Лук рейду: Power VIII, Punch IV, Infinity + Mending — 1 шт.",
      "Стріли — 192 шт.",
      "Ендер-перли — 24 шт.",
      "Тотеми безсмертя — 3 шт.",
      "Зачаровані золоті яблука — 2 шт.",
      "Золоті яблука — 20 шт.",
      "Зілля сили — 6 шт.",
      "Зілля швидкості — 6 шт.",
      "Зілля регенерації — 4 шт.",
      "ТНТ — 48 шт.",
      "Відра лави — 5 шт.",
      "Обсидіан — 64 шт.",
      "Варена яловичина — 128 шт."
    ],
    benefits: ["Найсильніший набір для зомбі у магазині.", "Зроблений для фінального тиску, коли треба ламати оборону людей."],
    itemsCommands: [...adminNetheriteArmorSet(), adminNetheriteSword, adminNetheriteAxe, adminBow, give("arrow", 192), give("ender_pearl", 24), give("totem_of_undying", 3), give("enchanted_golden_apple", 2), give("golden_apple", 20), give("potion", 6, `{Potion:"minecraft:strength"}`), give("potion", 6, `{Potion:"minecraft:swiftness"}`), give("potion", 4, `{Potion:"minecraft:regeneration"}`), give("tnt", 48), give("lava_bucket", 5), give("obsidian", 64), give("cooked_beef", 128)]
  },
  {
    name: "Комплект виживання",
    slug: "survival-shulker",
    description: "Комплект для довшої гри: ресурси, блоки, їжа, інструменти й повний захисний мінімум без зайвого контейнера.",
    price: 120,
    category: "survival_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Зачарований залізний меч — 1 шт.",
      "Варена яловичина — 64 шт.",
      "Хліб — 64 шт.",
      "Камінь — 128 шт.",
      "Дубові дошки — 128 шт.",
      "Смолоскипи — 64 шт.",
      "Скло — 64 шт.",
      "Драбини — 64 шт.",
      "Відро води — 1 шт.",
      "Залізна кирка — 1 шт.",
      "Залізна сокира — 1 шт.",
      "Залізні злитки — 32 шт.",
      "Вугілля — 64 шт.",
      "Золоті яблука — 2 шт."
    ],
    benefits: ["Добрий вибір для оборони, ремонту бази й виживання вночі.", "Дає багато матеріалів без надмірної бойової сили."],
    itemsCommands: [...ironArmorSet(), ironSword, give("cooked_beef", 64), give("bread", 64), ...survivalBlocks, give("iron_ingot", 32), give("coal", 64), give("golden_apple", 2)]
  },
  {
    name: "Комплект будівельника",
    slug: "builder-shulker",
    description: "Багато блоків і корисних інструментів для стін, проходів, аварійних барикад і ремонту.",
    price: 140,
    category: "survival_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Зачарований залізний меч — 1 шт.",
      "Камінь — 192 шт.",
      "Дубові дошки — 192 шт.",
      "Бруківка — 192 шт.",
      "Скло — 64 шт.",
      "Драбини — 64 шт.",
      "Смолоскипи — 128 шт.",
      "Відро води — 1 шт.",
      "Відро лави — 1 шт.",
      "Залізна кирка — 1 шт.",
      "Залізна сокира — 1 шт.",
      "Щит — 1 шт.",
      "Залізні злитки — 32 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Найкраще для гравців, які будують і тримають територію.", "Працює для людей і зомбі як ресурсний комплект."],
    itemsCommands: [...ironArmorSet(), ironSword, give("stone", 192), give("oak_planks", 192), give("cobblestone", 192), give("glass", 64), give("ladder", 64), give("torch", 128), give("water_bucket"), give("lava_bucket"), give("iron_pickaxe"), give("iron_axe"), give("shield"), give("iron_ingot", 32), give("cooked_beef", 64)]
  },
  {
    name: "Комплект шахтаря",
    slug: "miner-shulker",
    description: "Набір для видобутку, тунелів і швидкого ремонту проходів: кирки, світло, їжа й базовий захист.",
    price: 135,
    category: "survival_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Алмазна кирка — 1 шт.",
      "Залізна кирка — 2 шт.",
      "Залізна лопата — 1 шт.",
      "Смолоскипи — 192 шт.",
      "Вугілля — 64 шт.",
      "Драбини — 64 шт.",
      "Відро води — 1 шт.",
      "Варена яловичина — 64 шт.",
      "Залізні злитки — 32 шт."
    ],
    benefits: ["Для тунелів, шахт і швидкого підкопу під час івенту.", "Дає сильну утиліті-роль без прямого PvP-розгону."],
    itemsCommands: [...ironArmorSet(), give("diamond_pickaxe"), give("iron_pickaxe", 2), give("iron_shovel"), give("torch", 192), give("coal", 64), give("ladder", 64), give("water_bucket"), give("cooked_beef", 64), give("iron_ingot", 32)]
  },
  {
    name: "Комплект оборони бази",
    slug: "base-defense-shulker",
    description: "Ресурсний комплект для укріплення бази: міцні блоки, скло, лава, вода й запас світла.",
    price: 175,
    category: "survival_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Кам'яна цегла — 256 шт.",
      "Глибинна бруківка — 192 шт.",
      "Обсидіан — 64 шт.",
      "Скло — 128 шт.",
      "Смолоскипи — 192 шт.",
      "Відро води — 2 шт.",
      "Відро лави — 1 шт.",
      "Щити — 2 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Сильний вибір для команди, яка тримає базу.", "Обсидіан і лава піднімають ціну, але не дають адмін-чарів."],
    itemsCommands: [...ironArmorSet(), give("stone_bricks", 256), give("cobbled_deepslate", 192), give("obsidian", 64), give("glass", 128), give("torch", 192), give("water_bucket", 2), give("lava_bucket"), give("shield", 2), give("cooked_beef", 64)]
  },
  {
    name: "Інженерний комплект",
    slug: "engineer-shulker",
    description: "Для пасток, дверей, сигналів і механік: редстоун, поршні, ТНТ, інструменти та блоки.",
    price: 165,
    category: "survival_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Редстоун — 128 шт.",
      "Поршні — 24 шт.",
      "Липкі поршні — 12 шт.",
      "Повторювачі — 24 шт.",
      "ТНТ — 16 шт.",
      "Кварц — 32 шт.",
      "Залізна кирка — 1 шт.",
      "Залізна сокира — 1 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Дає інструменти для креативної оборони й пасток.", "ТНТ обмежений, щоб набір не був чистим рейд-набором."],
    itemsCommands: [...ironArmorSet(), give("redstone", 128), give("piston", 24), give("sticky_piston", 12), give("repeater", 24), give("tnt", 16), give("quartz", 32), give("iron_pickaxe"), give("iron_axe"), give("cooked_beef", 64)]
  },
  {
    name: "Командний склад",
    slug: "team-storage-shulker",
    description: "Великий командний набір для складу: шалкери, їжа, матеріали, світло й базові ресурси.",
    price: 190,
    category: "survival_shulkers",
    team: "all",
    contents: [
      "Звичайні шалкери — 3 шт.",
      "Варена яловичина — 128 шт.",
      "Хліб — 128 шт.",
      "Бруківка — 256 шт.",
      "Дубові дошки — 256 шт.",
      "Смолоскипи — 192 шт.",
      "Залізні злитки — 64 шт.",
      "Вугілля — 64 шт.",
      "Папір — 64 шт.",
      "Книги — 16 шт."
    ],
    benefits: ["Добре купувати на команду, а не на одного бійця.", "Підсилює логістику і не ламає PvP-баланс напряму."],
    itemsCommands: [give("shulker_box", 3), give("cooked_beef", 128), give("bread", 128), give("cobblestone", 256), give("oak_planks", 256), give("torch", 192), give("iron_ingot", 64), give("coal", 64), give("paper", 64), give("book", 16)]
  },
  {
    name: "Портальний комплект",
    slug: "portal-shulker",
    description: "Набір для порталу, швидких переходів і контролю небезпечних точок.",
    price: 155,
    category: "survival_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Обсидіан — 64 шт.",
      "Запальнички — 3 шт.",
      "Незерак — 128 шт.",
      "Кварц — 32 шт.",
      "Відра лави — 2 шт.",
      "Відра води — 2 шт.",
      "Смолоскипи — 128 шт.",
      "Золоті яблука — 4 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Корисний для переходів, пасток і контролю карти.", "Обсидіан і лава роблять набір дорожчим за звичайний будівельний."],
    itemsCommands: [...ironArmorSet(), give("obsidian", 64), give("flint_and_steel", 3), give("netherrack", 128), give("quartz", 32), give("lava_bucket", 2), give("water_bucket", 2), give("torch", 128), give("golden_apple", 4), give("cooked_beef", 64)]
  },
  {
    name: "Бойовий комплект",
    slug: "combat-shulker",
    description: "Бойовий комплект із алмазним мечем, луком, перлами, яблуками та зіллям для активного раунду.",
    price: 160,
    category: "combat_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Зачарований алмазний меч — 1 шт.",
      "Зачарована залізна сокира — 1 шт.",
      "Зачарований лук — 1 шт.",
      "Стріли — 128 шт.",
      "Щит — 1 шт.",
      "Золоті яблука — 8 шт.",
      "Ендер-перли — 8 шт.",
      "Зілля лікування — 4 шт.",
      "Зілля швидкості — 2 шт.",
      "Варена яловичина — 64 шт.",
      "Камінь — 128 шт.",
      "Дубові дошки — 128 шт.",
      "Смолоскипи — 64 шт."
    ],
    benefits: ["Сильний бойовий комплект за помітну кількість талерів.", "Підходить для кульмінаційних моментів стріму."],
    itemsCommands: [...ironArmorSet(), diamondSword, ironAxe, bow, give("arrow", 128), give("shield"), give("golden_apple", 8), give("ender_pearl", 8), ...potions, give("cooked_beef", 64), give("cobblestone", 128), give("oak_planks", 128), give("torch", 64)]
  },
  {
    name: "Посилений бойовий комплект",
    slug: "reinforced-combat-shulker",
    description: "Посилений комплект із алмазною бронею, тотемом, яблуком і повним бойовим запасом.",
    price: 220,
    category: "combat_shulkers",
    team: "all",
    contents: [
      "Зачарований алмазний сет броні — 1 комплект",
      "Зачарований алмазний меч — 1 шт.",
      "Зачарована алмазна сокира — 1 шт.",
      "Зачарований лук — 1 шт.",
      "Стріли — 128 шт.",
      "Щит — 1 шт.",
      "Золоті яблука — 10 шт.",
      "Зачароване золоте яблуко — 1 шт.",
      "Тотем безсмертя — 1 шт.",
      "Ендер-перли — 12 шт.",
      "Зілля сили — 3 шт.",
      "Зілля швидкості — 3 шт.",
      "Зілля регенерації — 3 шт.",
      "Варена яловичина — 64 шт.",
      "Камінь — 192 шт.",
      "Дубові дошки — 192 шт.",
      "Смолоскипи — 64 шт."
    ],
    benefits: ["Виглядає цінно й помітно дорожче за базові набори.", "Добре для донат-підтримки стріму під час напруженого раунду."],
    itemsCommands: [...diamondArmorSet(), diamondSword, diamondAxe, godBow, give("arrow", 128), give("shield"), give("golden_apple", 10), give("enchanted_golden_apple"), give("totem_of_undying"), give("ender_pearl", 12), ...strongPotions, give("cooked_beef", 64), give("cobblestone", 192), give("oak_planks", 192), give("torch", 64)]
  },
  {
    name: "Комплект рейдера",
    slug: "raider-combat-kit",
    description: "Для швидкого штурму: алмазна зброя, перли, ТНТ, лава й запас яблук.",
    price: 190,
    category: "combat_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Алмазний меч — 1 шт.",
      "Алмазна сокира — 1 шт.",
      "Арбалет — 1 шт.",
      "Стріли — 128 шт.",
      "Ендер-перли — 12 шт.",
      "ТНТ — 16 шт.",
      "Відра лави — 2 шт.",
      "Золоті яблука — 8 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Зібраний для атаки, але без бог-чарів.", "ТНТ і лава роблять його дорожчим за звичайний бойовий комплект."],
    itemsCommands: [...ironArmorSet(), give("diamond_sword"), give("diamond_axe"), give("crossbow"), give("arrow", 128), give("ender_pearl", 12), give("tnt", 16), give("lava_bucket", 2), give("golden_apple", 8), give("cooked_beef", 64)]
  },
  {
    name: "Комплект танка",
    slug: "tank-combat-kit",
    description: "Важчий комплект для гравця, який тримає прохід, приймає урон і не відступає першим.",
    price: 210,
    category: "combat_shulkers",
    team: "all",
    contents: [
      "Зачарований алмазний сет броні — 1 комплект",
      "Алмазний меч — 1 шт.",
      "Щити — 3 шт.",
      "Золоті яблука — 12 шт.",
      "Зілля регенерації — 4 шт.",
      "Зілля вогнестійкості — 2 шт.",
      "Відра молока — 2 шт.",
      "Варена яловичина — 64 шт.",
      "Обсидіан — 32 шт.",
      "Кам'яна цегла — 128 шт."
    ],
    benefits: ["Для захисту вузьких проходів і бази.", "Має багато виживання, але не містить адмінських чарів."],
    itemsCommands: [...diamondArmorSet(), give("diamond_sword"), give("shield", 3), give("golden_apple", 12), give("potion", 4, `{Potion:"minecraft:regeneration"}`), give("potion", 2, `{Potion:"minecraft:fire_resistance"}`), give("milk_bucket", 2), give("cooked_beef", 64), give("obsidian", 32), give("stone_bricks", 128)]
  },
  {
    name: "Комплект снайпера",
    slug: "sniper-combat-kit",
    description: "Дистанційний комплект із луком, арбалетом, стрілами, перлами й зіллям швидкості.",
    price: 180,
    category: "combat_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Лук — 1 шт.",
      "Арбалет — 1 шт.",
      "Стріли — 256 шт.",
      "Щит — 1 шт.",
      "Ендер-перли — 8 шт.",
      "Зілля швидкості — 4 шт.",
      "Золоті яблука — 6 шт.",
      "Драбини — 64 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Зручно для захисту стін і контролю відкритих зон.", "Менше ближнього бою, більше позиційної гри."],
    itemsCommands: [...ironArmorSet(), give("bow"), give("crossbow"), give("arrow", 256), give("shield"), give("ender_pearl", 8), give("potion", 4, `{Potion:"minecraft:swiftness"}`), give("golden_apple", 6), give("ladder", 64), give("cooked_beef", 64)]
  },
  {
    name: "Комплект алхіміка",
    slug: "alchemist-combat-kit",
    description: "Бойова підтримка на зіллях: сила, швидкість, регенерація, лікування й вогнестійкість.",
    price: 200,
    category: "combat_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Алмазний меч — 1 шт.",
      "Щит — 1 шт.",
      "Зілля сили — 4 шт.",
      "Зілля швидкості — 4 шт.",
      "Зілля регенерації — 4 шт.",
      "Зілля лікування — 6 шт.",
      "Зілля вогнестійкості — 2 шт.",
      "Золоті яблука — 6 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Для гравців, які грають від таймінгів і бафів.", "Дорогий через кількість зілля, але без адмін-ефектів."],
    itemsCommands: [...ironArmorSet(), give("diamond_sword"), give("shield"), give("potion", 4, `{Potion:"minecraft:strength"}`), give("potion", 4, `{Potion:"minecraft:swiftness"}`), give("potion", 4, `{Potion:"minecraft:regeneration"}`), give("potion", 6, `{Potion:"minecraft:healing"}`), give("potion", 2, `{Potion:"minecraft:fire_resistance"}`), give("golden_apple", 6), give("cooked_beef", 64)]
  },
  {
    name: "Комплект підривника",
    slug: "demolition-combat-kit",
    description: "Набір для контрольованого прориву: ТНТ, запальнички, лава, блоки й захист.",
    price: 210,
    category: "combat_shulkers",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Алмазний меч — 1 шт.",
      "Щит — 1 шт.",
      "ТНТ — 32 шт.",
      "Запальнички — 3 шт.",
      "Відра лави — 3 шт.",
      "Обсидіан — 32 шт.",
      "Бруківка — 192 шт.",
      "Золоті яблука — 8 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Для штурму укріплень за правилами івенту.", "Ціна висока, бо ТНТ і лава можуть сильно змінити бій."],
    itemsCommands: [...ironArmorSet(), give("diamond_sword"), give("shield"), give("tnt", 32), give("flint_and_steel", 3), give("lava_bucket", 3), give("obsidian", 32), give("cobblestone", 192), give("golden_apple", 8), give("cooked_beef", 64)]
  },
  {
    name: "Меч Бога: адмін-чари",
    slug: "god-sword",
    description: "Незеритовий клинок із Sharpness X, Looting VII та Unbreaking XII. Це survival-неможлива зброя для моменту, коли треба прорвати хвилю.",
    price: 200,
    category: "gods",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Незеритовий меч із адмін-чарами: Sharpness X, Looting VII, Fire Aspect IV — 1 шт.",
      "Золоті яблука — 4 шт.",
      "Варена яловичина — 32 шт.",
      "Блоки для будівництва — 64 шт.",
      "Ендер-перли — 8 шт.",
      "Смолоскипи — 64 шт."
    ],
    benefits: ["Адмін-чари, які не можна зробити у звичайному survival.", "Простий легендарний комплект для ближнього бою."],
    itemsCommands: [...ironArmorSet(), adminNetheriteSword, give("golden_apple", 4), give("cooked_beef", 32), give("cobblestone", 64), give("ender_pearl", 8), give("torch", 64)]
  },
  {
    name: "Лук Бога: неможливий постріл",
    slug: "god-bow",
    description: "Лук із Power VIII, Punch IV, Infinity та Mending одночасно. У survival таку комбінацію не зібрати.",
    price: 200,
    category: "gods",
    team: "all",
    contents: [
      "Зачарований залізний сет броні — 1 комплект",
      "Лук із адмін-чарами: Power VIII, Punch IV, Infinity + Mending — 1 шт.",
      "Стріли — 128 шт.",
      "Золоті яблука — 4 шт.",
      "Варена яловичина — 32 шт.",
      "Блоки для будівництва — 64 шт.",
      "Ендер-перли — 8 шт.",
      "Смолоскипи — 64 шт."
    ],
    benefits: ["Infinity і Mending разом плюс рівні вище survival-лімітів.", "Має мінімальний повний бронекомплект."],
    itemsCommands: [...ironArmorSet(), adminBow, give("arrow", 128), give("golden_apple", 4), give("cooked_beef", 32), give("cobblestone", 64), give("ender_pearl", 8), give("torch", 64)]
  },
  {
    name: "Набір Бога Танка: незламна оборона",
    slug: "god-tank-kit",
    description: "Преміум-набір для гравця, який тримає базу або вузький прохід: адмін-броня, тотеми, щити, регенерація й міцні блоки.",
    price: 380,
    category: "gods",
    team: "all",
    contents: [
      "Алмазний сет з адмін-чарами: Protection VIII + усі типи захисту — 1 комплект",
      "Щити — 2 шт.",
      "Тотеми безсмертя — 2 шт.",
      "Зачароване золоте яблуко — 1 шт.",
      "Золоті яблука — 16 шт.",
      "Зілля регенерації — 4 шт.",
      "Зілля вогнестійкості — 3 шт.",
      "Зілля лікування — 4 шт.",
      "Обсидіан — 64 шт.",
      "Кам'яна цегла — 192 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Зроблений для оборони, сейву точки й довгого виживання під тиском.", "Не має адмін-меча, тому ціна нижча за повний атакувальний набір."],
    itemsCommands: [...adminDiamondArmorSet(), give("shield", 2), give("totem_of_undying", 2), give("enchanted_golden_apple"), give("golden_apple", 16), give("potion", 4, `{Potion:"minecraft:regeneration"}`), give("potion", 3, `{Potion:"minecraft:fire_resistance"}`), give("potion", 4, `{Potion:"minecraft:healing"}`), give("obsidian", 64), give("stone_bricks", 192), give("cooked_beef", 64)]
  },
  {
    name: "Набір Бога Лучника: контроль дистанції",
    slug: "god-ranger-kit",
    description: "Дальній преміум-набір із луком адмін-рівня, арбалетом, мобільністю й ресурсами для позиційної гри.",
    price: 360,
    category: "gods",
    team: "all",
    contents: [
      "Алмазний сет з адмін-чарами: Protection VIII + усі типи захисту — 1 комплект",
      "Лук із адмін-чарами: Power VIII, Punch IV, Infinity + Mending — 1 шт.",
      "Арбалет із Quick Charge III та Piercing IV — 1 шт.",
      "Стріли — 256 шт.",
      "Ендер-перли — 16 шт.",
      "Зілля швидкості — 5 шт.",
      "Зілля сили — 3 шт.",
      "Золоті яблука — 12 шт.",
      "Тотем безсмертя — 1 шт.",
      "Драбини — 96 шт.",
      "Блоки для позицій — 192 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Сильний для оборони стін, відступів і контролю відкритих зон.", "Дорожчий за окремий лук, бо дає повний набір для дистанційної ролі."],
    itemsCommands: [...adminDiamondArmorSet(), adminBow, give("crossbow", 1, enchantments([{ id: "minecraft:quick_charge", lvl: "3s" }, { id: "minecraft:piercing", lvl: "4s" }, { id: "minecraft:unbreaking", lvl: "5s" }])), give("arrow", 256), give("ender_pearl", 16), give("potion", 5, `{Potion:"minecraft:swiftness"}`), give("potion", 3, `{Potion:"minecraft:strength"}`), give("golden_apple", 12), give("totem_of_undying"), give("ladder", 96), give("cobblestone", 192), give("cooked_beef", 64)]
  },
  {
    name: "Набір Бога Інженера: база під ключ",
    slug: "god-engineer-kit",
    description: "Набір для швидкого укріплення бази, пасток і аварійних проходів: адмін-сокира, маяк, редстоун, ТНТ, блоки й одне адмінське зілля.",
    price: 420,
    category: "gods",
    team: "all",
    contents: [
      "Алмазний сет з адмін-чарами: Protection VIII + усі типи захисту — 1 комплект",
      "Алмазна сокира з адмін-чарами — 1 шт.",
      "Маяк — 1 шт.",
      "Редстоун — 256 шт.",
      "Поршні — 32 шт.",
      "Липкі поршні — 16 шт.",
      "Повторювачі — 32 шт.",
      "ТНТ — 32 шт.",
      "Обсидіан — 64 шт.",
      "Відра води — 3 шт.",
      "Відра лави — 3 шт.",
      "Адмінське зілля всіх бафів — 1 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Для гравців, які несуть відповідальність за базу, пастки й логістику команди.", "Висока ціна через маяк, адмін-зілля, ТНТ і великий редстоун-комплект."],
    itemsCommands: [...adminDiamondArmorSet(), adminDiamondAxe, give("beacon"), give("redstone", 256), give("piston", 32), give("sticky_piston", 16), give("repeater", 32), give("tnt", 32), give("obsidian", 64), give("water_bucket", 3), give("lava_bucket", 3), give("potion", 1, adminAllEffectsPotionNbt), give("cooked_beef", 64)]
  },
  {
    name: "Набір Бога Рейдера: прорив хвилі",
    slug: "god-raider-kit",
    description: "Атакувальний преміум-набір із незеритовою адмін-зброєю, луком рейду, тотемом, перлами й мінімальним запасом для прориву.",
    price: 450,
    category: "gods",
    team: "all",
    contents: [
      "Алмазний сет з адмін-чарами: Protection VIII + усі типи захисту — 1 комплект",
      "Незеритовий меч із адмін-чарами: Sharpness X, Looting VII, Fire Aspect IV — 1 шт.",
      "Незеритова сокира з адмін-чарами — 1 шт.",
      "Лук рейду: Power VIII, Punch IV, Infinity + Mending — 1 шт.",
      "Стріли — 128 шт.",
      "Золоті яблука — 14 шт.",
      "Зачароване золоте яблуко — 1 шт.",
      "Тотем безсмертя — 1 шт.",
      "Ендер-перли — 16 шт.",
      "Зілля сили — 4 шт.",
      "Зілля швидкості — 4 шт.",
      "ТНТ — 16 шт.",
      "Обсидіан — 32 шт.",
      "Варена яловичина — 64 шт."
    ],
    benefits: ["Сильний варіант для вирішального штурму без повного незеритового сету.", "Баланс тримається тим, що броня алмазна, а не повний незерит Бога."],
    itemsCommands: [...adminDiamondArmorSet(), adminNetheriteSword, adminNetheriteAxe, adminBow, give("arrow", 128), give("golden_apple", 14), give("enchanted_golden_apple"), give("totem_of_undying"), give("ender_pearl", 16), give("potion", 4, `{Potion:"minecraft:strength"}`), give("potion", 4, `{Potion:"minecraft:swiftness"}`), give("tnt", 16), give("obsidian", 32), give("cooked_beef", 64)]
  },
  {
    name: "Набір Бога Воїна: адмін-сет",
    slug: "god-warrior-kit",
    description: "Алмазний адмін-сет із несумісними захистами, мечем Sharpness VIII і луком з Infinity + Mending. Не крафтиться у виживанні.",
    price: 320,
    category: "gods",
    team: "all",
    contents: [
      "Алмазний сет з адмін-чарами: Protection VIII + усі типи захисту — 1 комплект",
      "Алмазний меч хаосу: Sharpness VIII, Looting V, Unbreaking X — 1 шт.",
      "Алмазна сокира з адмін-чарами — 1 шт.",
      "Лук рейду: Power VIII, Infinity + Mending — 1 шт.",
      "Стріли — 128 шт.",
      "Золоті яблука — 12 шт.",
      "Зачароване золоте яблуко — 1 шт.",
      "Тотем безсмертя — 1 шт.",
      "Ендер-перли — 12 шт.",
      "Зілля сили — 4 шт.",
      "Зілля швидкості — 4 шт.",
      "Зілля регенерації — 4 шт.",
      "Блоки для будівництва — 192 шт.",
      "Варена яловичина — 64 шт.",
      "Смолоскипи — 64 шт."
    ],
    benefits: ["Преміум-набір із речами, які неможливо зробити у survival.", "Адміністрація може обмежити використання для балансу."],
    itemsCommands: [...adminDiamondArmorSet(), adminDiamondSword, adminDiamondAxe, adminBow, give("arrow", 128), give("golden_apple", 12), give("enchanted_golden_apple"), give("totem_of_undying"), give("ender_pearl", 12), give("potion", 4, `{Potion:"minecraft:strength"}`), give("potion", 4, `{Potion:"minecraft:swiftness"}`), give("potion", 4, `{Potion:"minecraft:regeneration"}`), give("cobblestone", 192), give("cooked_beef", 64), give("torch", 64)]
  },
  {
    name: "Повний набір Бога: неможливий сет",
    slug: "full-god-kit",
    description: "Максимальний адмін-комплект за талери: незерит із Protection X, меч Sharpness X, сокира, лук рейду, тотеми, зілля й блоки.",
    price: 500,
    category: "gods",
    team: "all",
    contents: [
      "Незеритовий сет з адмін-чарами: Protection X + усі типи захисту — 1 комплект",
      "Незеритовий меч апокаліпсису: Sharpness X, Looting VII — 1 шт.",
      "Незеритова сокира з Efficiency VIII, Sharpness X, Fortune V — 1 шт.",
      "Лук рейду: Power VIII, Punch IV, Infinity + Mending — 1 шт.",
      "Щит — 1 шт.",
      "Стріли — 128 шт.",
      "Золоті яблука — 16 шт.",
      "Зачаровані золоті яблука — 2 шт.",
      "Тотеми безсмертя — 2 шт.",
      "Ендер-перли — 16 шт.",
      "Зілля сили — 4 шт.",
      "Зілля швидкості — 4 шт.",
      "Зілля регенерації — 4 шт.",
      "Варена яловичина — 64 шт.",
      "Блоки для будівництва — 128 шт.",
      "Обсидіан — 64 шт.",
      "Маяк — 1 шт.",
      "Незеритові злитки — 4 шт."
    ],
    benefits: ["Найдорожчий набір магазину за внутрішню валюту.", "Усередині survival-неможливі предмети з адмін-рівнями чар."],
    itemsCommands: [...adminNetheriteArmorSet(), adminNetheriteSword, adminNetheriteAxe, adminBow, give("shield"), give("arrow", 128), give("golden_apple", 16), give("enchanted_golden_apple", 2), give("totem_of_undying", 2), give("ender_pearl", 16), give("potion", 4, `{Potion:"minecraft:strength"}`), give("potion", 4, `{Potion:"minecraft:swiftness"}`), give("potion", 4, `{Potion:"minecraft:regeneration"}`), give("cooked_beef", 64), give("cobblestone", 128), give("obsidian", 64), give("beacon"), give("netherite_ingot", 4)]
  },
  {
    name: "Компас людей: пошук зомбі",
    slug: "humans-zombie-compass",
    description: "Івент-компас для команди людей, який показує напрямок до найближчого зомбі під час активної фази полювання.",
    price: 150,
    category: "event_perks",
    team: "humans",
    contents: [
      "Компас на зомбі — 1 шт.",
      "Позначка compass_tracks_zombies для серверного плагіна — 1 гравець",
      "Діє тільки для команди людей"
    ],
    benefits: ["Допомагає людям швидше знаходити заражених і не бігати картою навмання.", "Дає інформаційну перевагу без додаткової броні, шкоди чи ресурсів."],
    itemsCommands: [
      humansZombieCompass,
      `/tag {nickname} add compass_tracks_zombies`,
      `/tellraw {nickname} {"text":"Компас на зомбі активовано. Тримай його в інвентарі під час полювання.","color":"red"}`
    ]
  },
  {
    name: "Компас зомбі: пошук людей",
    slug: "zombies-human-compass",
    description: "Івент-компас для команди зомбі, який показує напрямок до найближчої людини під час штурму або пошуку бази.",
    price: 150,
    category: "event_perks",
    team: "zombies",
    contents: [
      "Компас на людей — 1 шт.",
      "Позначка compass_tracks_humans для серверного плагіна — 1 гравець",
      "Діє тільки для команди зомбі"
    ],
    benefits: ["Допомагає зомбі знаходити людей, які ховаються або відходять від основної бази.", "Підсилює пошук і тиск, але не додає прямої бойової сили."],
    itemsCommands: [
      zombiesHumanCompass,
      `/tag {nickname} add compass_tracks_humans`,
      `/tellraw {nickname} {"text":"Компас на людей активовано. Використовуй його для пошуку виживших.","color":"green"}`
    ]
  },
  {
    name: "Збереження інвентарю на весь івент",
    slug: "keep-inventory-event",
    description: "Разова покупка для всього івенту: якщо гравець помирає, адміністратор або плагін має зберегти його інвентар.",
    price: 250,
    category: "event_perks",
    team: "all",
    contents: [
      "Право на збереження інвентарю до завершення івенту — 1 гравець",
      "Позначка для адміністратора або серверного плагіна — 1 шт.",
      "Діє тільки для Minecraft-ніка з акаунта покупця"
    ],
    benefits: ["Зменшує ризик втратити куплені ресурси.", "Добре підходить гравцям, які планують активну участь у всьому івенті."],
    itemsCommands: [
      `/tag {nickname} add keep_inventory_event`,
      `/tellraw {nickname} {"text":"Збереження інвентарю активовано на весь івент.","color":"gold"}`
    ]
  },
  {
    name: "Друге життя",
    slug: "second-life",
    description: "Одноразова можливість повернутися з команди зомбі назад до людей після зараження.",
    price: 180,
    category: "event_perks",
    team: "all",
    contents: [
      "Повернення зомбі назад у команду людей — 1 раз",
      "Позначка для адміністратора або серверного плагіна — 1 шт.",
      "Використовується вручну після звернення гравця до адміна"
    ],
    benefits: ["Дає шанс продовжити гру за людей після помилки.", "Створює драматичний comeback-момент на стрімі."],
    itemsCommands: [
      `/tag {nickname} add second_life_ready`,
      `/team join humans {nickname}`,
      `/tellraw {nickname} {"text":"Друге життя використано: ти знову людина.","color":"green"}`
    ]
  },
  {
    name: "Доступ до приватів",
    slug: "private-access",
    description: "Доступ до приватів на івент-сервері: гравець може приватити територію для бази або складу за правилами адміністрації.",
    price: 300,
    category: "event_perks",
    team: "all",
    contents: [
      "Право створювати привати або клейми на івент-сервері — 1 гравець",
      "Ліміти розміру, кількості та місця приватів визначає адміністрація",
      "Діє тільки для Minecraft-ніка з акаунта покупця"
    ],
    benefits: ["Допомагає захистити базу, склад або важливу точку команди.", "Корисно для гравців, які відповідають за будівництво й ресурси."],
    itemsCommands: [
      `/tag {nickname} add private_access`,
      `/tellraw {nickname} {"text":"Доступ до приватів активовано. Дотримуйся правил розміру та місця привату.","color":"green"}`
    ]
  },
  ...createResourceProducts()
];

async function main() {
  const currentSlugs = products.map((product) => product.slug);

  await prisma.storeSetting.upsert({
    where: { id: "global" },
    update: {},
    create: {
      id: "global",
      streamActive: false
    }
  });

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        ...product,
        contents: JSON.stringify(product.contents),
        benefits: JSON.stringify(product.benefits),
        itemsCommands: JSON.stringify(product.itemsCommands),
        isActive: true
      },
      create: {
        ...product,
        contents: JSON.stringify(product.contents),
        benefits: JSON.stringify(product.benefits),
        itemsCommands: JSON.stringify(product.itemsCommands),
        isActive: true
      }
    });
  }

  await prisma.product.deleteMany({
    where: {
      slug: {
        notIn: currentSlugs
      }
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
