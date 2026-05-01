"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, CreditCard, ExternalLink, Loader2, RefreshCw, TriangleAlert } from "lucide-react";
import { ItemIcon } from "@/components/ItemIcon";
import { formatHryvnias, formatTalers, topUpPackages } from "@/lib/currency";

type TopUpResponse = {
  topUpId?: string;
  paymentUrl?: string;
  paymentComment?: string;
  amountKopiyky?: number;
  amountTalers?: number;
  error?: string;
};

type TopUpStatus = "pending" | "paid" | "failed";

type TopUpStatusResponse = {
  topUp?: {
    id: string;
    status: TopUpStatus;
    amountKopiyky: number;
    amountTalers: number;
    paidAt: string | null;
  };
  error?: string;
};

type PendingJarPayment = {
  topUpId: string;
  paymentUrl: string;
  paymentComment: string;
  amountKopiyky: number;
  amountTalers: number;
  status: TopUpStatus;
};

export function TopUpPanel() {
  const router = useRouter();
  const [activePackageId, setActivePackageId] = useState<string | null>(null);
  const [pendingJarPayment, setPendingJarPayment] = useState<PendingJarPayment | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [paymentCheckMessage, setPaymentCheckMessage] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pendingJarPayment || pendingJarPayment.status !== "pending") {
      return;
    }

    let cancelled = false;
    const topUpId = pendingJarPayment.topUpId;

    async function checkTopUpStatus() {
      try {
        const response = await fetch(`/api/wallet/top-up/${encodeURIComponent(topUpId)}`, {
          cache: "no-store"
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as TopUpStatusResponse;
        const status = data.topUp?.status;

        if (!status || status === "pending" || cancelled) {
          return;
        }

        setPendingJarPayment((current) =>
          current?.topUpId === topUpId ? { ...current, status } : current
        );

        if (status === "paid") {
          router.refresh();
        }
      } catch {
        // Polling is best-effort: webhook processing will still credit the account.
      }
    }

    void checkTopUpStatus();
    const intervalId = window.setInterval(() => void checkTopUpStatus(), 3000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [pendingJarPayment, router]);

  async function copyComment(comment: string) {
    await navigator.clipboard.writeText(comment);
    setCopyMessage("Код скопійовано");
  }

  async function checkPaymentNow() {
    if (!pendingJarPayment) {
      return;
    }

    setIsCheckingPayment(true);
    setPaymentCheckMessage(null);

    try {
      const response = await fetch(`/api/wallet/top-up/${encodeURIComponent(pendingJarPayment.topUpId)}?check=1`, {
        cache: "no-store"
      });
      const data = (await response.json()) as TopUpStatusResponse;
      const status = data.topUp?.status;

      if (!response.ok) {
        throw new Error(data.error || "Не вдалося перевірити оплату");
      }

      if (!status || status === "pending") {
        setPaymentCheckMessage("Поки не бачу платіж у monobank. Якщо оплатив щойно, зачекай 30-60 секунд і перевір ще раз.");
        return;
      }

      setPendingJarPayment((current) =>
        current?.topUpId === pendingJarPayment.topUpId ? { ...current, status } : current
      );

      if (status === "paid") {
        setPaymentCheckMessage("Оплату знайдено. Талери зараховано на баланс.");
        router.refresh();
      } else {
        setPaymentCheckMessage(data.error || "Платіж не зараховано. Перевір суму та код у коментарі.");
      }
    } catch (caughtError) {
      const message = caughtError instanceof Error ? caughtError.message : "Не вдалося перевірити оплату";
      setPaymentCheckMessage(message);
    } finally {
      setIsCheckingPayment(false);
    }
  }

  async function startTopUp(packageId: string) {
    setActivePackageId(packageId);
    setPendingJarPayment(null);
    setCopyMessage(null);
    setPaymentCheckMessage(null);
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
        if (!data.topUpId) {
          throw new Error("Не вдалося увімкнути перевірку оплати");
        }

        setPendingJarPayment({
          topUpId: data.topUpId,
          paymentUrl: data.paymentUrl,
          paymentComment: data.paymentComment,
          amountKopiyky: data.amountKopiyky ?? 0,
          amountTalers: data.amountTalers ?? 0,
          status: "pending"
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

  const jarStatusLabel =
    pendingJarPayment?.status === "paid"
      ? "Оплату підтверджено. Талери вже зараховано на баланс."
      : pendingJarPayment?.status === "failed"
        ? "Платіж не зараховано. Перевір суму та код у коментарі або напиши адміну."
        : "Очікуємо оплату. Якщо скануєш QR з телефона, залиш цю вкладку відкритою.";

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
              <div
                className={`mt-4 inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-sm font-black ${
                  pendingJarPayment.status === "paid"
                    ? "border-moss/40 bg-moss/15 text-acid"
                    : pendingJarPayment.status === "failed"
                      ? "border-blood/40 bg-blood/10 text-red-100"
                      : "border-gold/35 bg-black/20 text-gold"
                }`}
              >
                {pendingJarPayment.status === "paid" ? (
                  <CheckCircle2 size={18} />
                ) : pendingJarPayment.status === "failed" ? (
                  <TriangleAlert size={18} />
                ) : (
                  <Loader2 className="animate-spin" size={18} />
                )}
                {jarStatusLabel}
              </div>
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
            <button
              type="button"
              onClick={() => void checkPaymentNow()}
              disabled={isCheckingPayment || pendingJarPayment.status !== "pending"}
              className="inline-flex items-center gap-2 rounded-sm border border-gold/35 bg-gold/10 px-4 py-3 font-black uppercase text-gold transition hover:bg-gold/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCheckingPayment ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
              Перевірити оплату
            </button>
          </div>
          {paymentCheckMessage ? (
            <p className="mt-3 max-w-3xl text-sm font-bold text-fog/70">{paymentCheckMessage}</p>
          ) : null}
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
