"use client";

import type {CartItem} from "@/components/cart/CartContext";
import type {ProductConfig} from "@/content/products";

export type RecommendationKind = "free" | "paid" | "waitlist";

export type CartRecommendation = {
  slug: string;
  title: string;
  imageSrc: string;
  kind: RecommendationKind;
  price?: number;
  currency?: string;
  priceLabel?: string;
};

const recommendationPriority = [
  "yearly-goals",
  "nutrition-meal-planner",
  "body-and-nutrition-tracker",
];

export const formatCurrency = (value: number, currency: string, locale: string) => {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: value % 1 === 0 ? 0 : 2,
    }).format(value);
  } catch {
    return `${value} ${currency}`;
  }
};

const inferRecommendationKind = (product: ProductConfig): RecommendationKind => {
  if (product.purchase?.type === "paid" && typeof product.purchase?.price === "number") {
    return "paid";
  }
  if (product.primaryCta?.type === "download") {
    return "free";
  }
  return "waitlist";
};

const toRecommendation = (product: ProductConfig): CartRecommendation | null => {
  const imageSrc =
    product.thumbnail ?? product.mainPreviewImage?.src ?? product.galleryImages?.[0]?.src;
  if (!imageSrc) {
    return null;
  }

  const kind = inferRecommendationKind(product);
  return {
    slug: product.slug,
    title: product.title,
    imageSrc,
    kind,
    price:
      kind === "paid" && typeof product.purchase?.price === "number"
        ? product.purchase.price
        : undefined,
    currency: kind === "paid" ? product.purchase?.currency ?? "USD" : undefined,
    priceLabel: kind === "waitlist" ? product.priceLabel : undefined,
  };
};

export const isFreeRecommendation = (item: CartRecommendation): boolean =>
  item.kind === "free";

export const isPaidRecommendation = (item: CartRecommendation): boolean =>
  item.kind === "paid";

export const getCartRecommendations = (
  items: CartItem[],
  products: ProductConfig[],
  limit = 2
): CartRecommendation[] => {
  const inCart = new Set(items.map((item) => item.slug));
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  return recommendationPriority
    .map((slug) => bySlug.get(slug))
    .filter((product): product is ProductConfig => Boolean(product))
    .filter((product) => !inCart.has(product.slug))
    .map(toRecommendation)
    .filter((item): item is CartRecommendation => Boolean(item))
    .slice(0, limit);
};

export const getCartRecommendedProducts = (
  items: CartItem[],
  products: ProductConfig[],
  limit = 3
): ProductConfig[] => {
  const inCart = new Set(items.map((item) => item.slug));
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  return recommendationPriority
    .map((slug) => bySlug.get(slug))
    .filter((product): product is ProductConfig => Boolean(product))
    .filter((product) => !inCart.has(product.slug))
    .slice(0, limit);
};

export const resolveCartItemsForLocale = (
  items: CartItem[],
  products: ProductConfig[]
): CartItem[] => {
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  return items.map((item) => {
    const product = bySlug.get(item.slug);
    if (!product) {
      return item;
    }

    const paidPrice =
      product.purchase?.type === "paid" && typeof product.purchase.price === "number"
        ? product.purchase.price
        : item.price;
    const paidCurrency =
      product.purchase?.type === "paid"
        ? product.purchase.currency ?? item.currency
        : item.currency;

    return {
      ...item,
      title: product.title,
      subtitle: product.shortDescription,
      imageSrc: product.thumbnail ?? product.mainPreviewImage?.src ?? item.imageSrc,
      price: paidPrice,
      currency: paidCurrency,
      quantity: 1,
    };
  });
};
