"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, PackageCheck, UserRound, Wallet } from "lucide-react";
import { formatTalers } from "@/lib/currency";

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
  const [form, setForm] = useState<CheckoutState>({
    playerNickname: initialUser?.minecraftNickname ?? "",
    contact: initialUser?.contact ?? ""
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          contact: form.contact.trim()
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

      {error ? (
        <div className="mt-5 rounded-sm border border-blood/40 bg-blood/10 p-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting || !initialUser || initialUser.balance < product.price}
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
