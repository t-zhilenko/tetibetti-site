import type {ProductConfig} from "@/content/products";

export type ProductCardItem = {
  slug: string;
  title: string;
  image?: {
    src: string;
    alt: string;
  };
  price?: number;
  currency?: string;
  priceLabel?: string;
  isFree: boolean;
  isComingSoon: boolean;
  href: string;
  ctaLabel?: string;
  secondaryText?: string;
};

export const toProductCardItem = (product: ProductConfig): ProductCardItem => {
  const paidPrice =
    product.purchase?.type === "paid" && typeof product.purchase?.price === "number"
      ? product.purchase.price
      : undefined;
  const isPaid = typeof paidPrice === "number";
  const isComingSoon = product.status !== "available" || product.purchase?.type === "waitlist";
  const isFree = !isPaid && !isComingSoon;
  const imageSrc =
    product.thumbnail ?? product.galleryImages?.[0]?.src ?? product.mainPreviewImage?.src;

  return {
    slug: product.slug,
    title: product.title,
    image: imageSrc
      ? {
          src: imageSrc,
          alt: product.mainPreviewImage?.alt ?? product.title,
        }
      : undefined,
    price: paidPrice,
    currency: product.purchase?.currency ?? "USD",
    priceLabel: product.priceLabel,
    isFree,
    isComingSoon,
    href: `/products/${product.slug}`,
    ctaLabel: isPaid
      ? product.purchase?.ctaLabel
      : isFree
        ? product.primaryCta?.label ?? product.cta
        : product.cta,
    secondaryText: product.shortDescription,
  };
};
