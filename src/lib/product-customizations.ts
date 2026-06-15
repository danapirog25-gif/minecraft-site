export const CUSTOM_DISCORD_ROLE_SLUG = "custom-discord-role";

export const CUSTOM_ROLE_COLOR_PRESETS = [
  "#FACC15",
  "#A3E635",
  "#22D3EE",
  "#60A5FA",
  "#A78BFA",
  "#F472B6",
  "#FB7185",
  "#F97316"
] as const;

export type DiscordRoleCustomization = {
  type: "discord_role";
  discordUsername: string;
  roleName: string;
  roleColor: string;
};

export type ProductCustomization = DiscordRoleCustomization;

const forbiddenRoleNames = new Set(["@everyone", "everyone", "@here", "here"]);

export function isCustomDiscordRoleProduct(product: { slug: string }) {
  return product.slug === CUSTOM_DISCORD_ROLE_SLUG;
}

export function normalizeRoleColor(value: string) {
  const normalized = value.trim().replace(/^#?/, "#").toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : CUSTOM_ROLE_COLOR_PRESETS[0];
}

export function isValidDiscordRoleName(value: string) {
  const roleName = value.trim();

  return (
    roleName.length >= 2 &&
    roleName.length <= 40 &&
    !/[\u0000-\u001F\u007F]/.test(roleName) &&
    !forbiddenRoleNames.has(roleName.toLowerCase())
  );
}

export function isValidDiscordUsername(value: string) {
  const username = value.trim();
  return username.length >= 2 && username.length <= 80 && !/[\u0000-\u001F\u007F]/.test(username);
}

export function isProductCustomization(value: unknown): value is ProductCustomization {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    item.type === "discord_role" &&
    typeof item.discordUsername === "string" &&
    isValidDiscordUsername(item.discordUsername) &&
    typeof item.roleName === "string" &&
    isValidDiscordRoleName(item.roleName) &&
    typeof item.roleColor === "string" &&
    /^#[0-9A-Fa-f]{6}$/.test(item.roleColor)
  );
}

export function formatProductCustomizationLines(customization: ProductCustomization | undefined) {
  if (!customization) {
    return [];
  }

  if (customization.type === "discord_role") {
    return [
      `Discord: ${customization.discordUsername}`,
      `Назва ролі: ${customization.roleName}`,
      `Колір: ${normalizeRoleColor(customization.roleColor)}`
    ];
  }

  return [];
}

export function customizationCommandVariables(customization: ProductCustomization | undefined) {
  if (!customization) {
    return {};
  }

  if (customization.type === "discord_role") {
    const roleColor = normalizeRoleColor(customization.roleColor);

    return {
      discordUsername: customization.discordUsername.trim(),
      discordRoleName: customization.roleName.trim(),
      discordRoleColor: roleColor,
      roleName: customization.roleName.trim(),
      roleColor
    };
  }

  return {};
}
