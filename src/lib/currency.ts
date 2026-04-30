export const SITE_CURRENCY = {
  name: "Талери",
  iconKind: "gold_ingot"
} as const;

export const topUpPackages = [
  {
    id: "talers-50",
    talers: 50,
    amountKopiyky: 2500
  },
  {
    id: "talers-100",
    talers: 100,
    amountKopiyky: 5000
  },
  {
    id: "talers-200",
    talers: 200,
    amountKopiyky: 10000
  },
  {
    id: "talers-400",
    talers: 400,
    amountKopiyky: 20000
  }
] as const;

export type TopUpPackageId = (typeof topUpPackages)[number]["id"];

export function pluralizeTalers(amount: number): string {
  const absolute = Math.abs(amount);
  const lastTwo = absolute % 100;
  const last = absolute % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "талерів";
  }

  if (last === 1) {
    return "талер";
  }

  if (last >= 2 && last <= 4) {
    return "талери";
  }

  return "талерів";
}

export function formatTalers(amount: number): string {
  return `${new Intl.NumberFormat("uk-UA", { maximumFractionDigits: 0 }).format(amount)} ${pluralizeTalers(amount)}`;
}

export function formatHryvnias(kopiyky: number): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: kopiyky % 100 === 0 ? 0 : 2
  }).format(kopiyky / 100);
}

export function getTopUpPackage(packageId: string) {
  return topUpPackages.find((pack) => pack.id === packageId) ?? null;
}
