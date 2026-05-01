"use client";

import { useState } from "react";
import { Copy, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { ItemIcon } from "@/components/ItemIcon";
import { formatHryvnias, formatTalers, topUpPackages } from "@/lib/currency";

type TopUpResponse = {
  paymentUrl?: string;
  paymentComment?: string;
  amountKopiyky?: number;
  amountTalers?: number;
  error?: string;
};

type PendingJarPayment = {
  paymentUrl: string;
  paymentComment: string;
  amountKopiyky: number;
  amountTalers: number;
};

export function TopUpPanel() {
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [pendingJarPayment, setPendingJarPayment] = useState<PendingJarPayment | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copyComment(comment: string) {
    await navigator.clipboard.writeText(comment);
    setCopyMessage("Код скопійовано");
  }

  async function startTopUp(packageId: string) {
    setActivePackageId(packageId);
    setPendingJarPayment(null);
    setCopyMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/wallet/top-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ packageId })
      });

      const data = (await response.json()) as TopUpResponse;
      if (!response.ok || !data.paymentUrl) {
        throw new Error(data.error || "Не вдалося створити оплату");
      }

      if (data.paymentComment) {
        setPendingJarPayment({
          paymentUrl: data.paymentUrl,
          paymentComment: data.paymentComment,
          amountKopiyky: data.amountKopiyky ?? 0,
          amountTalers: data.amountTalers ?? 0
        });
        setActivePackageId(null);
        return;
      }

      window.location.href = data.paymentUrl;
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Невідома помилка";
      setError(message);
      setActivePackageId(null);
    }
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      {topUpPackages.map((pack) => {
        const isLoading = activePackageId === pack.id;

        return (
          <article key={pack.id} className="panel shop-card rounded-sm p-5 hover:border-moss/40 hover:shadow-glow">
            <div className="flex items-start justify-between gap-4">
              <div className="item-cube grid h-16 w-16 place-items-center border border-gold/30 bg-gold/10">
                <ItemIcon kind="gold_ingot" size="md" />
              </div>
              <span className="rounded-sm border border-moss/30 bg-moss/10 px-2.5 py-1 text-xs font-black uppercase text-acid">
                +{pack.talers}
              </span>
            </div>
            <h3 className="mt-5 text-2xl font-black text-white">{formatTalers(pack.talers)}</h3>
            <p className="mt-2 text-lg font-black text-gold">{formatHryvnias(pack.amountKopiyky)}</p>
            <button
              type="button"
              onClick={() => void startTopUp(pack.id)}
              disabled={activePackageId !== null}
              className="menu-button mt-6 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-moss px-4 py-3 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
              Поповнити
            </button>
          </article>
        );
      })}

      {pendingJarPayment ? (
        <div className="rounded-sm border border-gold/35 bg-gold/10 p-5 md:col-span-2 xl:col-span-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-gold">Оплата через банку monobank</p>
              <h3 className="mt-2 text-2xl font-black text-white">
                Донат {formatHryvnias(pendingJarPayment.amountKopiyky)} за {formatTalers(pendingJarPayment.amountTalers)}
              </h3>
              <p className="mt-3 max-w-3xl leading-7 text-fog/70">
                Встав цей код у коментар до платежу. Після webhook від monobank талери автоматично зарахуються на твій акаунт.
              </p>
            </div>
            <div className="rounded-sm border border-white/15 bg-black/25 p-4">
              <p className="text-xs font-black uppercase text-fog/50">Коментар до платежу</p>
              <p className="mt-2 font-mono text-2xl font-black tracking-wide text-gold">{pendingJarPayment.paymentComment}</p>
              {copyMessage ? <p className="mt-2 text-xs font-bold text-acid">{copyMessage}</p> : null}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void copyComment(pendingJarPayment.paymentComment)}
              className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-4 py-3 font-black text-fog/85 transition hover:bg-white/20 hover:text-white"
            >
              <Copy size={18} />
              Скопіювати код
            </button>
            <a
              href={pendingJarPayment.paymentUrl}
              target="_blank"
              rel="noreferrer"
              className="menu-button inline-flex items-center gap-2 rounded-sm bg-moss px-4 py-3 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid"
            >
              <ExternalLink size={18} />
              Відкрити банку
            </a>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-sm border border-blood/40 bg-blood/10 p-4 text-sm text-red-100 md:col-span-2 xl:col-span-4">
          {error}
        </div>
      ) : null}
    </div>
  );
}
