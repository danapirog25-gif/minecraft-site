export const PUBLIC_PRODUCT_WHERE = {
  isActive: true,
  team: "all",
  category: {
    not: "event_perks"
  }
} as const;

export function isPublicStoreProduct(product: { category: string; team: string; isActive?: boolean }) {
  return product.isActive !== false && product.team === "all" && product.category !== "event_perks";
}
