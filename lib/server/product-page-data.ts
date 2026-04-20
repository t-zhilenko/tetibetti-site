import {
  getAllProductSlugs,
  getProductBySlug as getContentProductBySlug,
  getProducts as getContentProducts,
  type ProductConfig,
  type ProductPrimaryCta,
  type ProductPurchaseConfig,
} from "@/content/products";
import type { Locale } from "@/i18n/routing";
import {
  isComingSoonProduct,
  isFreeProduct,
  isPaidProduct,
  isProductPurchasable,
} from "@/lib/payments/product-helpers";
import type { Product as CommerceProduct } from "@/lib/payments/types";
import { getDb } from "@/lib/server/db";
import {
  getProductBySlug as getCommerceProductBySlug,
  listProductsBySlugs,
} from "@/lib/server/repositories/products";

const formatPriceLabel = (priceMinor: number, currency: string, locale: Locale): string => {
  const majorPrice = priceMinor / 100;
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: majorPrice % 1 === 0 ? 0 : 2,
    }).format(majorPrice);
  } catch {
    return `${majorPrice} ${currency}`;
  }
};

const toDisplayStatus = (
  product: CommerceProduct,
): ProductConfig["status"] => {
  if (isComingSoonProduct(product)) {
    return "waiting";
  }

  if (isProductPurchasable(product)) {
    return "available";
  }

  return "waiting";
};

const buildResolvedPrimaryCta = (
  contentProduct: ProductConfig,
  commerceProduct: CommerceProduct,
): ProductPrimaryCta | undefined => {
  if (isComingSoonProduct(commerceProduct)) {
    return {
      type: "waitlist",
      label: contentProduct.primaryCta?.label ?? "Join waitlist",
      helperText: contentProduct.primaryCta?.helperText,
      endpoint: contentProduct.primaryCta?.endpoint ?? "/api/brevo/subscribe",
    };
  }

  if (isProductPurchasable(commerceProduct) && isFreeProduct(commerceProduct)) {
    return {
      type: "download",
      label: contentProduct.primaryCta?.label ?? contentProduct.ctaLabel ?? contentProduct.cta,
      helperText: contentProduct.primaryCta?.helperText ?? contentProduct.ctaNote,
      endpoint: contentProduct.primaryCta?.endpoint,
    };
  }

  return contentProduct.primaryCta;
};

const buildResolvedPurchase = (
  contentProduct: ProductConfig,
  commerceProduct: CommerceProduct,
): ProductPurchaseConfig | undefined => {
  if (!isProductPurchasable(commerceProduct)) {
    return {
      ...contentProduct.purchase,
      type: "waitlist",
      price: undefined,
      currency: commerceProduct.currency,
    };
  }

  if (isComingSoonProduct(commerceProduct)) {
    return {
      ...contentProduct.purchase,
      type: "waitlist",
      price: undefined,
      currency: commerceProduct.currency,
    };
  }

  if (isFreeProduct(commerceProduct)) {
    return {
      ...contentProduct.purchase,
      type: "free",
      price: 0,
      currency: commerceProduct.currency,
    };
  }

  if (isPaidProduct(commerceProduct)) {
    return {
      ...contentProduct.purchase,
      type: "paid",
      price: commerceProduct.priceMinor / 100,
      currency: commerceProduct.currency,
    };
  }

  return contentProduct.purchase;
};

const applyCommerceToContentProduct = (
  contentProduct: ProductConfig,
  commerceProduct: CommerceProduct,
  locale: Locale,
): ProductConfig => {
  const status = toDisplayStatus(commerceProduct);
  const showPaidPriceLabel =
    isProductPurchasable(commerceProduct) && isPaidProduct(commerceProduct);

  return {
    ...contentProduct,
    slug: commerceProduct.slug,
    title: commerceProduct.name,
    status,
    priceLabel: showPaidPriceLabel
      ? formatPriceLabel(commerceProduct.priceMinor, commerceProduct.currency, locale)
      : contentProduct.priceLabel,
    primaryCta: buildResolvedPrimaryCta(contentProduct, commerceProduct),
    purchase: buildResolvedPurchase(contentProduct, commerceProduct),
  };
};

export const getProductPageBySlug = async (
  locale: Locale,
  slug: string,
): Promise<ProductConfig | null> => {
  const contentProduct = getContentProductBySlug(locale, slug);
  if (!contentProduct) {
    return null;
  }

  const db = await getDb();
  const commerceProduct = await getCommerceProductBySlug(db, slug);
  if (!commerceProduct) {
    return null;
  }

  return applyCommerceToContentProduct(contentProduct, commerceProduct, locale);
};

export const getProductsWithCommerce = async (locale: Locale): Promise<ProductConfig[]> => {
  const contentProducts = getContentProducts(locale);
  const slugs = getAllProductSlugs();

  const db = await getDb();
  const commerceProducts = await listProductsBySlugs(db, slugs);
  const commerceProductsBySlug = new Map(
    commerceProducts.map((product) => [product.slug, product]),
  );

  return contentProducts
    .map((contentProduct) => {
      const commerceProduct = commerceProductsBySlug.get(contentProduct.slug);
      if (!commerceProduct) {
        return null;
      }

      return applyCommerceToContentProduct(contentProduct, commerceProduct, locale);
    })
    .filter((product): product is ProductConfig => Boolean(product));
};
