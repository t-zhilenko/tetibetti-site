import type { ProductStatus } from "@/lib/payments/types";
import { isProductPurchasable } from "@/lib/payments/product-helpers";

export type ProductConfig = {
  slug: string;
  name: string;
  priceMinor: number;
  currency: string;
  deliveryType: string;
  targetUrl: string | null;
  isActive: boolean;
  status: ProductStatus;
};

export type PaidProductConfig = ProductConfig;

export const PRODUCTS: ReadonlyArray<ProductConfig> = [
  {
    slug: "yearly-goals",
    name: "Yearly Goals",
    priceMinor: 0,
    currency: "USD",
    deliveryType: "token_link",
    targetUrl: null,
    isActive: true,
    status: "active",
  },
  {
    slug: "nutrition-meal-planner",
    name: "Nutrition Meal Planner",
    priceMinor: 0,
    currency: "USD",
    deliveryType: "token_link",
    targetUrl: null,
    isActive: true,
    status: "coming_soon",
  },
  {
    slug: "body-and-nutrition-tracker",
    name: "Body & Nutrition Tracker",
    priceMinor: 0,
    currency: "USD",
    deliveryType: "token_link",
    targetUrl: null,
    isActive: true,
    status: "active",
  },
];

export const PAID_PRODUCTS = PRODUCTS;

const productBySlug = new Map(PRODUCTS.map((product) => [product.slug, product]));

export const getConfiguredProductBySlug = (slug: string): ProductConfig | undefined =>
  productBySlug.get(slug);

export { isProductPurchasable };
