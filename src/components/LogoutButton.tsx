"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className="inline-flex items-center justify-center gap-2 rounded-sm border border-blood/35 bg-blood/10 px-4 py-3 font-black uppercase text-red-100 transition hover:-translate-y-1 hover:bg-blood/20 disabled:cursor-not-allowed disabled:opacity-80"
    >
      {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <LogOut size={18} />}
      Вийти
    </button>
  );
}
