"use client";

import { useState } from "react";
import { Copy, CreditCard, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { ItemIcon } from "@/components/ItemIcon";
import { formatHryvnias, formatTalers, topUpPackages } from "@/lib/currency";

type TopUpResponse = {
  topUpId?: string;
  paymentUrl?: string | null;
  paymentComment?: string;
  amountKopiyky?: number;
  amountTalers?: number;
  error?: string;
};

type ManualTopUp = {
  topUpId: string;
  paymentUrl: string | null;
  paymentComment: string;
  amountKopiyky: number;
  amountTalers: number;
};

export function TopUpPanel() {
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [manualTopUp, setManualTopUp] = useState<ManualTopUp | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copyComment(comment: string) {
    await navigator.clipboard.writeText(comment);
    setCopyMessage("Нікнейм скопійовано");
  }

  async function startTopUp(packageId: string) {
    setActivePackageId(packageId);
    setManualTopUp(null);
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
      if (!response.ok || !data.topUpId || !data.paymentComment) {
        throw new Error(data.error || "Не вдалося створити заявку на поповнення");
      }

      setManualTopUp({
        topUpId: data.topUpId,
        paymentUrl: data.paymentUrl ?? null,
        paymentComment: data.paymentComment,
        amountKopiyky: data.amountKopiyky ?? 0,
        amountTalers: data.amountTalers ?? 0
      });
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Невідома помилка";
      setError(message);
    } finally {
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
              Створити заявку
            </button>
          </article>
        );
      })}

      {manualTopUp ? (
        <div className="rounded-sm border border-gold/35 bg-gold/10 p-5 md:col-span-2 xl:col-span-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-gold">Ручне поповнення</p>
              <h3 className="mt-2 text-2xl font-black text-white">
                Заявка на {formatTalers(manualTopUp.amountTalers)} за {formatHryvnias(manualTopUp.amountKopiyky)}
              </h3>
              <p className="mt-3 max-w-3xl leading-7 text-fog/70">
                Оплати цю суму й обовʼязково впиши в коментарі до платежу нікнейм із сайту. Саме за ним адмін зрозуміє, кому видати талери.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-sm border border-moss/35 bg-moss/10 px-3 py-2 text-sm font-black text-acid">
                <ShieldCheck size={18} />
                Талери видаються вручну протягом 24 годин, бо адмін поки не зробив нормальну оплату.
              </div>
            </div>
            <div className="rounded-sm border border-white/15 bg-black/25 p-4">
              <p className="text-xs font-black uppercase text-fog/50">Сума до оплати</p>
              <p className="mt-2 text-2xl font-black text-gold">{formatHryvnias(manualTopUp.amountKopiyky)}</p>
              <div className="my-4 h-px bg-white/10" />
              <p className="text-xs font-black uppercase text-fog/50">Коментар до платежу</p>
              <p className="mt-2 break-all font-mono text-2xl font-black tracking-wide text-gold">{manualTopUp.paymentComment}</p>
              {copyMessage ? <p className="mt-2 text-xs font-bold text-acid">{copyMessage}</p> : null}
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void copyComment(manualTopUp.paymentComment)}
              className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-4 py-3 font-black text-fog/85 transition hover:bg-white/20 hover:text-white"
            >
              <Copy size={18} />
              Скопіювати нікнейм
            </button>
            {manualTopUp.paymentUrl ? (
              <a
                href={manualTopUp.paymentUrl}
                target="_blank"
                rel="noreferrer"
                className="menu-button inline-flex items-center gap-2 rounded-sm bg-moss px-4 py-3 font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid"
              >
                <ExternalLink size={18} />
                Відкрити оплату
              </a>
            ) : null}
          </div>
          <p className="mt-3 max-w-3xl text-sm font-bold text-fog/70">
            Заявка вже зʼявилась в адмінці. Після переказу просто зачекай: талери додадуться на баланс вручну.
          </p>
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
