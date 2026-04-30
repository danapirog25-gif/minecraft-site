"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { ItemIcon } from "@/components/ItemIcon";
import { formatHryvnias, formatTalers, topUpPackages } from "@/lib/currency";

export function TopUpPanel() {
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startTopUp(packageId: string) {
    setActivePackageId(packageId);
    setError(null);

    try {
      const response = await fetch("/api/wallet/top-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ packageId })
      });

      const data = (await response.json()) as { paymentUrl?: string; error?: string };
      if (!response.ok || !data.paymentUrl) {
        throw new Error(data.error || "Не вдалося створити оплату");
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

      {error ? (
        <div className="rounded-sm border border-blood/40 bg-blood/10 p-4 text-sm text-red-100 md:col-span-2 xl:col-span-4">
          {error}
        </div>
      ) : null}
    </div>
  );
}
