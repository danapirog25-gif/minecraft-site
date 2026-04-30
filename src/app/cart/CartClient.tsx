"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, MessageCircle, PackageCheck, Trash2, UserRound, Wallet } from "lucide-react";
import { ItemIcon } from "@/components/ItemIcon";
import {
  CartProduct,
  clearCartProducts,
  readCartProducts,
  removeCartProduct
} from "@/components/cart-storage";
import { formatTalers } from "@/lib/currency";

type CartClientProps = {
  initialUser: {
    email: string;
    minecraftNickname: string;
    contact: string | null;
    balance: number;
  } | null;
};

export function CartClient({ initialUser }: CartClientProps) {
  const [items, setItems] = useState<CartProduct[]>([]);
  const [contact, setContact] = useState(initialUser?.contact ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setItems(readCartProducts());
  }, []);

  const total = useMemo(() => items.reduce((sum, item) => sum + item.price, 0), [items]);
  const canCheckout = Boolean(initialUser) && items.length > 0 && initialUser!.balance >= total;

  function removeItem(productId: string) {
    setItems(removeCartProduct(productId));
  }

  function clearCart() {
    clearCartProducts();
    setItems([]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!initialUser) {
      setError("Увійдіть в акаунт, щоб оформити кошик");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productIds: items.map((item) => item.id),
          contact: contact.trim()
        })
      });

      const data = (await response.json()) as { orderId?: string; error?: string };

      if (!response.ok || !data.orderId) {
        throw new Error(data.error || "Не вдалося створити замовлення");
      }

      clearCartProducts();
      window.location.href = `/account?orderId=${encodeURIComponent(data.orderId)}`;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Невідома помилка";
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.46fr]">
      <section className="grid gap-4">
        {items.length ? (
          items.map((item) => (
            <article key={item.id} className="panel rounded-sm p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-4">
                  <div className="item-cube grid h-16 w-16 shrink-0 place-items-center border border-white/10 bg-black/25">
                    <ItemIcon kind={item.iconKind} size="md" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">{item.name}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-fog/62">{item.description}</p>
                    <Link href={`/shop/${item.slug}`} className="mt-3 inline-flex items-center gap-2 text-sm font-black text-acid transition hover:text-white">
                      Деталі товару
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
                  <p className="text-2xl font-black text-gold">{formatTalers(item.price)}</p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="mt-0 inline-flex items-center gap-2 rounded-sm border border-blood/35 bg-blood/10 px-3 py-2 text-sm font-black text-red-100 transition hover:bg-blood/20 sm:mt-4"
                  >
                    <Trash2 size={15} />
                    Прибрати
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="panel rounded-sm p-8 text-center">
            <PackageCheck className="mx-auto text-moss" size={42} />
            <h2 className="mt-4 text-2xl font-black text-white">Кошик порожній</h2>
            <p className="mt-3 text-fog/60">Додайте набори або ресурси з магазину, а потім оформіть усе одним замовленням.</p>
            <Link
              href="/shop"
              className="menu-button mt-6 inline-flex items-center gap-2 rounded-sm bg-moss px-6 py-3 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid"
            >
              Перейти в магазин
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </section>

      <aside className="panel h-fit rounded-sm p-6 shadow-glow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-moss">Оформлення</p>
            <h2 className="mt-2 text-3xl font-black text-white">Кошик</h2>
          </div>
          <div className="item-cube grid h-12 w-12 place-items-center border border-gold/30 bg-gold/10">
            <Wallet className="text-gold" size={24} />
          </div>
        </div>

        <div className="mt-6 rounded-sm border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-fog/70">Товарів</span>
            <strong className="text-white">{items.length}</strong>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-fog/70">Разом</span>
            <strong className="text-2xl text-gold">{formatTalers(total)}</strong>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-fog/70">Баланс</span>
            <strong className={initialUser && initialUser.balance >= total ? "text-xl text-acid" : "text-xl text-red-100"}>
              {formatTalers(initialUser?.balance ?? 0)}
            </strong>
          </div>
        </div>

        {initialUser ? (
          <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
            <div className="grid gap-2">
              <span className="text-sm font-black uppercase text-fog/70">Minecraft-нік</span>
              <div className="flex items-center gap-3 rounded-sm border border-white/20 bg-black/30 px-4 py-3">
                <UserRound className="shrink-0 text-moss" size={18} />
                <span className="font-bold text-white">{initialUser.minecraftNickname}</span>
              </div>
            </div>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase text-fog/70">Telegram або Discord</span>
              <div className="flex items-center gap-3 rounded-sm border border-white/20 bg-black/30 px-4 py-3 transition focus-within:border-moss focus-within:shadow-glow">
                <MessageCircle className="shrink-0 text-ward" size={18} />
                <input
                  required
                  minLength={3}
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  className="w-full bg-transparent text-white outline-none placeholder:text-fog/40"
                  placeholder="@nickname або nickname#0001"
                />
              </div>
            </label>

            {initialUser.balance < total ? (
              <div className="rounded-sm border border-lava/40 bg-lava/10 p-4 text-sm leading-6 text-orange-100">
                Недостатньо талерів для покупки.
                <Link href="/top-up" className="ml-2 font-black text-acid transition hover:text-white">
                  Поповнити баланс
                </Link>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-sm border border-blood/40 bg-blood/10 p-4 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canCheckout || isSubmitting}
              className="menu-button inline-flex w-full items-center justify-center gap-3 rounded-sm bg-moss px-6 py-4 text-base font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <PackageCheck size={20} />}
              Купити все за талери
            </button>
          </form>
        ) : (
          <div className="mt-6 rounded-sm border border-moss/30 bg-moss/10 p-4 text-sm leading-6 text-acid">
            Увійдіть в акаунт, щоб оформити кошик за талери.
            <Link href="/login?next=/cart" className="ml-2 font-black text-white transition hover:text-acid">
              Увійти
            </Link>
          </div>
        )}

        {items.length ? (
          <button
            type="button"
            onClick={clearCart}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm border border-white/20 px-4 py-3 font-bold text-fog/70 transition hover:bg-white/10 hover:text-white"
          >
            <Trash2 size={16} />
            Очистити кошик
          </button>
        ) : null}

        <p className="mt-5 text-sm leading-6 text-fog/60">
          Ціни й доступність товарів фінально перевіряються на сервері під час оформлення.
        </p>
      </aside>
    </div>
  );
}
