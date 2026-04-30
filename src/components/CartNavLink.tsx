"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { CART_CHANGED_EVENT, readCartProducts } from "@/components/cart-storage";

type CartNavLinkProps = {
  className?: string;
};

export function CartNavLink({ className = "" }: CartNavLinkProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function sync() {
      setCount(readCartProducts().length);
    }

    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return (
    <Link
      href="/cart"
      className={`inline-flex items-center gap-2 rounded-sm border border-white/15 bg-white/5 px-3 py-2 text-fog/75 transition hover:bg-white/10 hover:text-white ${className}`}
    >
      <ShoppingCart size={15} />
      Кошик
      {count > 0 ? (
        <span className="rounded-sm bg-gold px-1.5 py-0.5 text-xs font-black text-bunker">{count}</span>
      ) : null}
    </Link>
  );
}
