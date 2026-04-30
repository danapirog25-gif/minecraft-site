"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import {
  addCartProduct,
  CART_CHANGED_EVENT,
  CartProduct,
  readCartProducts
} from "@/components/cart-storage";

type CartButtonProps = {
  product: CartProduct;
  compact?: boolean;
  className?: string;
};

export function CartButton({ product, compact = false, className = "" }: CartButtonProps) {
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    function sync() {
      setIsInCart(readCartProducts().some((item) => item.id === product.id));
    }

    sync();
    window.addEventListener(CART_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [product.id]);

  if (isInCart) {
    return (
      <Link
        href="/cart"
        className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-sm border border-gold/35 bg-gold/10 font-black text-gold transition hover:bg-gold/20 ${
          compact ? "px-3 py-2 text-xs leading-none" : "px-4 py-3"
        } ${className}`}
      >
        <Check size={compact ? 16 : 18} />
        <span className="whitespace-nowrap">{compact ? "У кошику" : "Переглянути кошик"}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => addCartProduct(product)}
      className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-sm border border-white/20 bg-white/10 font-black text-white transition hover:-translate-y-1 hover:bg-white/20 ${
        compact ? "px-3 py-2 text-xs leading-none" : "px-4 py-3"
      } ${className}`}
    >
      <ShoppingCart size={compact ? 16 : 18} />
      <span className="whitespace-nowrap">{compact ? "В кошик" : "Додати в кошик"}</span>
    </button>
  );
}
