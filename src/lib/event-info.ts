const defaultDiscordUrl = "https://discord.gg/SKKDGGhdGG";

function getDiscordUrl(value: string | undefined) {
  const url = value?.trim();
  const normalizedUrl = url?.replace(/\/+$/, "").toLowerCase();

  if (!url || normalizedUrl === "https://discord.gg" || normalizedUrl === "https://discord.com") {
    return defaultDiscordUrl;
  }

  return url;
}

export const eventInfo = {
  startAt: process.env.NEXT_PUBLIC_EVENT_START_AT ?? "",
  serverAddress: process.env.NEXT_PUBLIC_MINECRAFT_SERVER ?? "Буде оголошено перед стартом",
  streamUrl: process.env.NEXT_PUBLIC_STREAM_URL ?? "https://www.youtube.com/",
  discordUrl: getDiscordUrl(process.env.NEXT_PUBLIC_DISCORD_URL),
  telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "waife9260@gmail.com"
} as const;

export const eventEndConditions = [
  "Зомбі перемагають, якщо заразили всіх людей або адміністрація оголосила падіння бази.",
  "Люди перемагають, якщо хоча б один виживший протримався 100 Minecraft-днів.",
  "Розбійник перемагає окремо, якщо сам дожив до кінця таймера / 100 Minecraft-днів."
] as const;

export const zombieVictoryRewardTalers = 50;
export const banditRewardPercent = 60;

export const humanVictoryRewards = [
  { survivors: 1, reward: 250 },
  { survivors: 2, reward: 220 },
  { survivors: 3, reward: 200 },
  { survivors: 4, reward: 180 },
  { survivors: 5, reward: 165 },
  { survivors: 6, reward: 150 },
  { survivors: 7, reward: 140 },
  { survivors: 8, reward: 130 },
  { survivors: 9, reward: 120 },
  { survivors: 10, reward: 110 },
  { survivors: 11, reward: 100 },
  { survivors: 12, reward: 95 },
  { survivors: 13, reward: 90 },
  { survivors: 14, reward: 85 },
  { survivors: 15, reward: 80 },
  { survivors: 16, reward: 75 },
  { survivors: 17, reward: 70 },
  { survivors: 18, reward: 65 },
  { survivors: 19, reward: 60 },
  { survivors: 20, reward: 58 },
  { survivors: 21, reward: 56 },
  { survivors: 22, reward: 54 },
  { survivors: 23, reward: 52 },
  { survivors: 24, reward: 50 },
  { survivors: 25, reward: 48 },
  { survivors: 26, reward: 46 },
  { survivors: 27, reward: 44 },
  { survivors: 28, reward: 42 },
  { survivors: 29, reward: 40 },
  { survivors: 30, reward: 38 }
] as const;

export const banditSoloRewardTalers = Math.round((humanVictoryRewards[0].reward * banditRewardPercent) / 100);

export const banditRules = [
  "Розбійник грає сам за себе: він не людина і не зомбі.",
  "У нього тільки 1 життя. Після смерті він одразу втрачає роль і стає зараженим.",
  "Вночі розбійник отримує speed та invisibility, а вдень має weakness і під відкритим небом світиться.",
  "Компаси людей і зомбі не ведуть на розбійника.",
  `Якщо розбійник пережив таймер сам, він отримує ${banditSoloRewardTalers} талерів. Якщо вижив разом із людьми, його приз — ${banditRewardPercent}% від виплати одного вижившого.`
] as const;

export function getEventStartIso() {
  if (!eventInfo.startAt) {
    return "";
  }

  const date = new Date(eventInfo.startAt);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString();
}
