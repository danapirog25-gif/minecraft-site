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
  "Люди перемагають, якщо хоча б один виживший протримався 100 Minecraft-днів."
] as const;

export const zombieVictoryRewardTalers = 120;
export const killRewardTalers = 10;

export const humanVictoryRewards = [
  { survivors: 1, reward: 500 },
  { survivors: 2, reward: 440 },
  { survivors: 3, reward: 400 },
  { survivors: 4, reward: 360 },
  { survivors: 5, reward: 330 },
  { survivors: 6, reward: 300 },
  { survivors: 7, reward: 280 },
  { survivors: 8, reward: 260 },
  { survivors: 9, reward: 240 },
  { survivors: 10, reward: 220 },
  { survivors: 11, reward: 205 },
  { survivors: 12, reward: 190 },
  { survivors: 13, reward: 180 },
  { survivors: 14, reward: 170 },
  { survivors: 15, reward: 160 },
  { survivors: 16, reward: 150 },
  { survivors: 17, reward: 145 },
  { survivors: 18, reward: 140 },
  { survivors: 19, reward: 135 },
  { survivors: 20, reward: 130 },
  { survivors: 21, reward: 125 },
  { survivors: 22, reward: 120 },
  { survivors: 23, reward: 115 },
  { survivors: 24, reward: 110 },
  { survivors: 25, reward: 105 },
  { survivors: 26, reward: 100 },
  { survivors: 27, reward: 95 },
  { survivors: 28, reward: 90 },
  { survivors: 29, reward: 85 },
  { survivors: 30, reward: 80 }
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
