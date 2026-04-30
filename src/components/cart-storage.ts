"use client";

export const CART_STORAGE_KEY = "zombie-event-cart-v1";
export const CART_CHANGED_EVENT = "zombie-event-cart-changed";

export type CartProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: string;
  team: string;
  iconKind: string;
};

function isCartProduct(value: unknown): value is CartProduct {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    typeof item.slug === "string" &&
    typeof item.description === "string" &&
    typeof item.price === "number" &&
    typeof item.category === "string" &&
    typeof item.team === "string" &&
    typeof item.iconKind === "string"
  );
}

export function readCartProducts(): CartProduct[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY) ?? "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }

    const unique = new Map<string, CartProduct>();
    for (const item of parsed) {
      if (isCartProduct(item)) {
        unique.set(item.id, item);
      }
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}

export function writeCartProducts(products: CartProduct[]) {
  if (typeof window === "undefined") {
    return;
  }

  const unique = Array.from(new Map(products.map((product) => [product.id, product])).values());
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(unique));
  window.dispatchEvent(new Event(CART_CHANGED_EVENT));
}

export function clearCartProducts() {
  writeCartProducts([]);
}

export function addCartProduct(product: CartProduct) {
  const current = readCartProducts();
  if (current.some((item) => item.id === product.id)) {
    return current;
  }

  const next = [...current, product];
  writeCartProducts(next);
  return next;
}

export function removeCartProduct(productId: string) {
  const next = readCartProducts().filter((item) => item.id !== productId);
  writeCartProducts(next);
  return next;
}
