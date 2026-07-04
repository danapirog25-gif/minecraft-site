const defaultDiscordUrl = "https://discord.gg/SKKDGGhdGG";

function getDiscordUrl(value: string | undefined) {
  const url = value?.trim();
  const normalizedUrl = url?.replace(/\/+$/, "").toLowerCase();

  if (!url || normalizedUrl === "https://discord.gg" || normalizedUrl === "https://discord.com") {
    return defaultDiscordUrl;
  }

  return url;
}

export const siteInfo = {
  name: "Магазин речей та наборів",
  tagline: "Minecraft-ресурси для виживання",
  description: "Minecraft-магазин ресурсів, наборів, шалкерів і корисних предметів для виживання з модами.",
  icon: "/minecraft-items/shulker_box.png",
  discordUrl: getDiscordUrl(process.env.NEXT_PUBLIC_DISCORD_URL),
  telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "https://t.me/",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "waife9260@gmail.com"
} as const;
