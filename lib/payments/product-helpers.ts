import type { Product, ProductStatus } from "@/lib/payments/types";

type ProductCommerceLike = Pick<Product, "isActive" | "status" | "priceMinor">;

export const isProductStatus = (value: string): value is ProductStatus =>
  value === "active" || value === "coming_soon" || value === "archived";

export const isProductPurchasable = (product: ProductCommerceLike): boolean =>
  product.isActive === true && product.status === "active";

export const isComingSoonProduct = (product: ProductCommerceLike): boolean =>
  product.status === "coming_soon";

export const isFreeProduct = (product: ProductCommerceLike): boolean =>
  product.priceMinor === 0;

export const isPaidProduct = (product: ProductCommerceLike): boolean =>
  product.priceMinor > 0;
