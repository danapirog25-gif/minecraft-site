"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AtSign, BadgeCheck, Loader2, MessageCircle, PackageCheck, Palette, Sparkles, UserRound, Wallet } from "lucide-react";
import { formatTalers } from "@/lib/currency";
import {
  CUSTOM_ROLE_COLOR_PRESETS,
  isCustomDiscordRoleProduct,
  isValidDiscordRoleName,
  isValidDiscordUsername,
  normalizeRoleColor,
  type DiscordRoleCustomization
} from "@/lib/product-customizations";

type CheckoutFormProps = {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
  };
  initialUser?: {
    email: string;
    minecraftNickname: string;
    contact: string | null;
    balance: number;
  } | null;
};

type CheckoutState = {
  playerNickname: string;
  contact: string;
};

export default function CheckoutForm({ product, initialUser }: CheckoutFormProps) {
  const isCustomRole = isCustomDiscordRoleProduct(product);
  const [form, setForm] = useState<CheckoutState>({
    playerNickname: initialUser?.minecraftNickname ?? "",
    contact: initialUser?.contact ?? ""
  });
  const [roleForm, setRoleForm] = useState<DiscordRoleCustomization>({
    type: "discord_role",
    discordUsername: initialUser?.contact ?? "",
    roleName: "",
    roleColor: CUSTOM_ROLE_COLOR_PRESETS[0]
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roleColor = normalizeRoleColor(roleForm.roleColor);
  const isRoleFormValid =
    !isCustomRole ||
    (isValidDiscordUsername(roleForm.discordUsername) &&
      isValidDiscordRoleName(roleForm.roleName) &&
      /^#?[0-9A-Fa-f]{6}$/.test(roleForm.roleColor));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId: product.id,
          contact: form.contact.trim(),
          customizations: isCustomRole
            ? {
                [product.id]: {
                  type: "discord_role",
                  discordUsername: roleForm.discordUsername.trim(),
                  roleName: roleForm.roleName.trim(),
                  roleColor
                }
              }
            : undefined
        })
      });

      const data = (await response.json()) as { orderId?: string; error?: string };

      if (!response.ok || !data.orderId) {
        throw new Error(data.error || "Не вдалося створити замовлення");
      }

      window.location.href = `/account?orderId=${encodeURIComponent(data.orderId)}`;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Невідома помилка";
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel rounded-sm p-6 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-moss">Checkout</p>
          <h2 className="mt-2 text-3xl font-black text-white">Дані гравця</h2>
          {initialUser ? (
            <p className="mt-2 text-sm font-bold text-acid">
              Оформлюємо через акаунт {initialUser.minecraftNickname}
            </p>
          ) : null}
        </div>
        <div className="item-cube grid h-12 w-12 place-items-center border border-moss/30 bg-moss/10">
          <Wallet className="text-acid" size={24} />
        </div>
      </div>

      <div className="mt-6 grid gap-5">
        <div className="grid gap-2">
          <span className="text-sm font-black uppercase text-fog/70">Minecraft-нік</span>
          <div className="flex items-center gap-3 rounded-sm border border-white/20 bg-black/30 px-4 py-3">
            <UserRound className="shrink-0 text-moss" size={18} />
            <span className="font-bold text-white">{initialUser?.minecraftNickname ?? form.playerNickname}</span>
          </div>
        </div>
        <label className="grid gap-2">
          <span className="text-sm font-black uppercase text-fog/70">Telegram або Discord</span>
          <div className="flex items-center gap-3 rounded-sm border border-white/20 bg-black/30 px-4 py-3 transition focus-within:border-moss focus-within:shadow-glow">
            <MessageCircle className="shrink-0 text-ward" size={18} />
            <input
              required
              minLength={3}
              value={form.contact}
              onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))}
              className="w-full bg-transparent text-white outline-none placeholder:text-fog/40"
              placeholder="@nickname або nickname#0001"
            />
          </div>
        </label>
      </div>

      {isCustomRole ? (
        <section className="mt-6 rounded-sm border border-gold/35 bg-gold/10 p-4 shadow-goldglow">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide text-gold">
                <Sparkles size={16} />
                Кастомна Discord-роль
              </p>
              <h3 className="mt-2 text-2xl font-black text-white">Обери вигляд ролі</h3>
              <p className="mt-2 text-sm leading-6 text-fog/70">
                Після покупки адмін створить роль у Discord і видасть її на вказаний акаунт.
              </p>
            </div>
            <div className="rounded-sm border border-white/10 bg-black/35 p-3 text-right">
              <p className="text-xs font-black uppercase text-fog/45">Превʼю</p>
              <div
                className="mt-2 inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-sm font-black"
                style={{ borderColor: `${roleColor}88`, backgroundColor: `${roleColor}1F`, color: roleColor }}
              >
                <BadgeCheck size={16} />
                {roleForm.roleName.trim() || "Назва ролі"}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-black uppercase text-fog/70">
                <AtSign size={16} className="text-ward" />
                Discord-нік
              </span>
              <input
                required={isCustomRole}
                minLength={2}
                maxLength={80}
                value={roleForm.discordUsername}
                onChange={(event) => setRoleForm((current) => ({ ...current, discordUsername: event.target.value }))}
                className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-fog/40 focus:border-gold focus:shadow-goldglow"
                placeholder="@nickname або username"
              />
            </label>

            <label className="grid gap-2">
              <span className="inline-flex items-center gap-2 text-sm font-black uppercase text-fog/70">
                <BadgeCheck size={16} className="text-gold" />
                Назва ролі
              </span>
              <input
                required={isCustomRole}
                minLength={2}
                maxLength={40}
                value={roleForm.roleName}
                onChange={(event) => setRoleForm((current) => ({ ...current, roleName: event.target.value }))}
                className="rounded-sm border border-white/20 bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-fog/40 focus:border-gold focus:shadow-goldglow"
                placeholder="Наприклад: Легенда івенту"
              />
              <span className="text-xs font-bold leading-5 text-fog/55">2-40 символів, без @everyone та @here.</span>
            </label>

            <div className="grid gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-black uppercase text-fog/70">
                <Palette size={16} className="text-acid" />
                Колір ролі
              </span>
              <div className="grid gap-3 sm:grid-cols-[1fr_150px] sm:items-center">
                <div className="flex flex-wrap gap-2">
                  {CUSTOM_ROLE_COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setRoleForm((current) => ({ ...current, roleColor: color }))}
                      className={`h-10 w-10 rounded-sm border transition hover:-translate-y-1 ${
                        roleColor === color ? "border-white ring-2 ring-gold/60" : "border-white/20"
                      }`}
                      style={{ backgroundColor: color }}
                      aria-label={`Обрати колір ${color}`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-2">
                  <input
                    type="color"
                    value={roleColor}
                    onChange={(event) => setRoleForm((current) => ({ ...current, roleColor: event.target.value }))}
                    className="h-11 w-11 cursor-pointer rounded-sm border border-white/20 bg-black/30 p-1"
                    aria-label="Колір ролі"
                  />
                  <input
                    value={roleForm.roleColor}
                    onChange={(event) => setRoleForm((current) => ({ ...current, roleColor: event.target.value.toUpperCase() }))}
                    className="rounded-sm border border-white/20 bg-black/30 px-3 py-3 font-mono text-sm uppercase text-white outline-none transition focus:border-gold focus:shadow-goldglow"
                    placeholder="#FACC15"
                    pattern="#?[0-9A-Fa-f]{6}"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="mt-6 rounded-sm border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-fog/70">Обраний товар</span>
          <strong className="text-right text-white">{product.name}</strong>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-fog/70">Сума</span>
          <strong className="text-xl text-acid">{formatTalers(product.price)}</strong>
        </div>
        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-fog/70">Баланс</span>
          <strong className={initialUser && initialUser.balance >= product.price ? "text-xl text-gold" : "text-xl text-red-100"}>
            {formatTalers(initialUser?.balance ?? 0)}
          </strong>
        </div>
      </div>

      {initialUser && initialUser.balance < product.price ? (
        <div className="mt-5 rounded-sm border border-lava/40 bg-lava/10 p-4 text-sm leading-6 text-orange-100">
          Недостатньо талерів для покупки.
          <Link href="/top-up" className="ml-2 font-black text-acid transition hover:text-white">
            Поповнити баланс
          </Link>
        </div>
      ) : null}

      {isCustomRole && !isRoleFormValid ? (
        <div className="mt-5 rounded-sm border border-gold/35 bg-gold/10 p-4 text-sm leading-6 text-gold">
          Заповніть Discord-нік, назву ролі 2-40 символів і коректний hex-колір, щоб оформити покупку.
        </div>
      ) : null}

      {error ? (
        <div className="mt-5 rounded-sm border border-blood/40 bg-blood/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !initialUser || initialUser.balance < product.price || !isRoleFormValid}
        className="menu-button mt-6 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-moss px-6 py-4 text-base font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid disabled:cursor-not-allowed disabled:opacity-80"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <PackageCheck size={20} />}
        Купити за талери
      </button>
      <p className="mt-4 text-sm leading-6 text-fog/60">
        Ресурси можна придбати у будь-який час. Видача відбудеться одразу після початку стріму та відкриття сервера.
      </p>
    </form>
  );
}
