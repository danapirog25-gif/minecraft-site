"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { AtSign, KeyRound, Loader2, MessageCircle, UserRound } from "lucide-react";

type AuthFormProps = {
  mode: "login" | "register";
};

type AuthFormState = {
  email: string;
  password: string;
  minecraftNickname: string;
  contact: string;
};

const initialForm: AuthFormState = {
  email: "",
  password: "",
  minecraftNickname: "",
  contact: ""
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<AuthFormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload = isRegister
        ? {
            email: form.email.trim(),
            password: form.password,
            minecraftNickname: form.minecraftNickname.trim(),
            contact: form.contact.trim()
          }
        : {
            email: form.email.trim(),
            password: form.password
          };

      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Не вдалося увійти");
      }

      router.push(new URLSearchParams(window.location.search).get("next") || "/account");
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Невідома помилка");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="panel pixel-corners w-full max-w-xl p-7 shadow-glow sm:p-8">
      <p className="text-sm font-black uppercase tracking-wide text-moss">
        {isRegister ? "Новий акаунт" : "Вхід в акаунт"}
      </p>
      <h1 className="voxel-title mt-3 text-4xl font-black uppercase text-white">
        {isRegister ? "Реєстрація" : "Авторизація"}
      </h1>
      <p className="mt-4 leading-7 text-fog/65">
        {isRegister
          ? "Створи акаунт, щоб швидше оформлювати замовлення й бачити історію покупок."
          : "Увійди, щоб переглянути свої замовлення й не вводити дані щоразу."}
      </p>

      <div className="mt-7 grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-black uppercase text-fog/70">Email</span>
          <div className="flex items-center gap-3 rounded-sm border border-white/20 bg-black/30 px-4 py-3 transition focus-within:border-moss focus-within:shadow-glow">
            <AtSign className="shrink-0 text-moss" size={18} />
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full bg-transparent text-white outline-none placeholder:text-fog/40"
              placeholder="you@example.com"
            />
          </div>
        </label>

        {isRegister ? (
          <>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase text-fog/70">Minecraft-нік</span>
              <div className="flex items-center gap-3 rounded-sm border border-white/20 bg-black/30 px-4 py-3 transition focus-within:border-moss focus-within:shadow-glow">
                <UserRound className="shrink-0 text-moss" size={18} />
                <input
                  required
                  minLength={3}
                  maxLength={16}
                  pattern="[A-Za-z0-9_]{3,16}"
                  value={form.minecraftNickname}
                  onChange={(event) => setForm((current) => ({ ...current, minecraftNickname: event.target.value }))}
                  className="w-full bg-transparent text-white outline-none placeholder:text-fog/40"
                  placeholder="Steve_ua"
                />
              </div>
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-black uppercase text-fog/70">Telegram або Discord</span>
              <div className="flex items-center gap-3 rounded-sm border border-white/20 bg-black/30 px-4 py-3 transition focus-within:border-moss focus-within:shadow-glow">
                <MessageCircle className="shrink-0 text-ward" size={18} />
                <input
                  maxLength={80}
                  value={form.contact}
                  onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))}
                  className="w-full bg-transparent text-white outline-none placeholder:text-fog/40"
                  placeholder="@nickname або nickname#0001"
                />
              </div>
            </label>
          </>
        ) : null}

        <label className="grid gap-2">
          <span className="text-sm font-black uppercase text-fog/70">Пароль</span>
          <div className="flex items-center gap-3 rounded-sm border border-white/20 bg-black/30 px-4 py-3 transition focus-within:border-moss focus-within:shadow-glow">
            <KeyRound className="shrink-0 text-gold" size={18} />
            <input
              required
              type="password"
              minLength={isRegister ? 8 : 1}
              maxLength={72}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full bg-transparent text-white outline-none placeholder:text-fog/40"
              placeholder={isRegister ? "мінімум 8 символів" : "твій пароль"}
            />
          </div>
        </label>
      </div>

      {error ? <div className="mt-5 rounded-sm border border-blood/40 bg-blood/10 p-4 text-sm text-red-100">{error}</div> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="menu-button mt-7 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-moss px-6 py-4 text-base font-black uppercase text-bunker transition hover:-translate-y-1 hover:bg-acid disabled:cursor-not-allowed disabled:opacity-80"
      >
        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <UserRound size={20} />}
        {isRegister ? "Створити акаунт" : "Увійти"}
      </button>

      <p className="mt-5 text-center text-sm text-fog/60">
        {isRegister ? "Вже маєш акаунт?" : "Ще немає акаунта?"}{" "}
        <Link className="font-black text-acid transition hover:text-white" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Увійти" : "Зареєструватися"}
        </Link>
      </p>
    </form>
  );
}
