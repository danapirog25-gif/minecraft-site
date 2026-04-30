"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, UserRound } from "lucide-react";
import { CartNavLink } from "@/components/CartNavLink";
import { ItemIcon } from "@/components/ItemIcon";
import { formatTalers } from "@/lib/currency";

type MobileMenuProps = {
  user: {
    minecraftNickname: string;
    balance: number;
  } | null;
};

const links = [
  { href: "/shop", label: "Магазин" },
  { href: "/event", label: "Івент наживо" },
  { href: "/faq", label: "FAQ" },
  { href: "/rules", label: "Правила" },
  { href: "/shop#gods", label: "Суперпредмети" }
];

export function MobileMenu({ user }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="grid h-11 w-11 place-items-center rounded-sm border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
        aria-label={isOpen ? "Закрити меню" : "Відкрити меню"}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {isOpen ? (
        <div className="absolute left-4 right-4 top-[72px] z-50 rounded-sm border border-white/10 bg-bunker/95 p-4 shadow-block backdrop-blur-xl">
          <div className="grid gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-sm border border-white/10 bg-white/5 px-4 py-3 font-black text-fog/80 transition hover:bg-white/10 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 grid gap-2 border-t border-white/10 pt-4">
            <CartNavLink className="justify-center py-3 font-black" />
            {user ? (
              <>
                <Link
                  href="/top-up"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-gold/25 bg-gold/10 px-4 py-3 font-black text-gold transition hover:bg-gold/20"
                >
                  <ItemIcon kind="gold_ingot" size="xs" />
                  {formatTalers(user.balance)}
                </Link>
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-moss/25 bg-moss/10 px-4 py-3 font-black text-moss transition hover:bg-moss/20 hover:text-acid"
                >
                  <UserRound size={16} />
                  {user.minecraftNickname}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-moss/25 bg-moss/10 px-4 py-3 font-black text-moss transition hover:bg-moss/20 hover:text-acid"
              >
                <UserRound size={16} />
                Увійти
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
