"use client";

import Image from "next/image";
import {useLocale} from "next-intl";
import {useCart} from "@/components/cart/CartContext";
import type {ProductCardItem} from "@/components/product-card-data";
import {Link} from "@/i18n/navigation";
import {trackEvent} from "@/lib/analytics";

type ProductCardProps = {
  item: ProductCardItem;
  onAddToCart?: (item: ProductCardItem) => void;
};

const primaryCtaClassName =
  "inline-flex h-10 w-full items-center justify-center rounded-full border border-deep/10 bg-blush/60 px-4 text-[13px] font-medium text-deep/80 transition-colors hover:bg-blush/70";
const disabledPrimaryCtaClassName =
  "inline-flex h-10 w-full cursor-default items-center justify-center rounded-full border border-deep/10 bg-blush/60 px-4 text-[13px] font-medium text-deep/80 opacity-55";

const PlaceholderImage = ({title}: {title: string}) => {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-blush/20">
      <div className="px-6 text-center text-xs uppercase tracking-[0.24em] text-deep/25">
        {title}
      </div>
    </div>
  );
};

const formatCurrency = (value: number, currency: string, locale: string) => {
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

export default function ProductCard({item, onAddToCart}: ProductCardProps) {
  const locale = useLocale();
  const {addItem} = useCart();
  const hasImage = Boolean(item.image?.src);
  const isPaid = !item.isComingSoon && !item.isFree;

  const handleAddToCart = () => {
    if (!isPaid) {
      return;
    }

    if (onAddToCart) {
      onAddToCart(item);
      return;
    }

    const price = item.price ?? 0;
    const currency = item.currency ?? "USD";

    addItem({
      slug: item.slug,
      title: item.title,
      imageSrc: item.image?.src,
      subtitle: item.secondaryText,
      price,
      currency,
    });

    trackEvent("checkout_cta_clicked", {
      source: "shop_card",
      product_slug: item.slug,
      product_name: item.title,
      cta_type: "add_to_cart",
    });
  };

  const ctaLabel = item.ctaLabel
    ? item.ctaLabel
    : isPaid
      ? locale === "uk"
        ? "Додати в кошик"
        : "Add to cart"
      : item.isFree
        ? locale === "uk"
          ? "Відкрити"
          : "Open"
        : locale === "uk"
          ? "Скоро"
          : "Coming soon";
  const priceText = isPaid
    ? formatCurrency(item.price ?? 0, item.currency ?? "USD", locale)
    : item.isFree
      ? locale === "uk"
        ? "Безкоштовно"
        : "Free"
      : item.priceLabel ?? (locale === "uk" ? "Скоро" : "Coming soon");

  return (
    <article className="flex h-full flex-col rounded-[22px] border border-[#dfc2c0]/28 bg-[#fdfcfa] p-5 shadow-[0_12px_28px_rgba(223,194,192,0.2)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_18px_34px_rgba(223,194,192,0.26)]">
      <div className="flex h-full flex-col space-y-5">
        <Link
          href={item.href}
          className="group block w-full"
          aria-label={item.title}
        >
          {hasImage ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-[16px] border border-[#dfc2c0]/22 bg-[#f8f6f5]">
              <Image
                src={item.image!.src}
                alt={item.image!.alt}
                fill
                sizes="(min-width: 1024px) 320px, (min-width: 768px) 280px, 90vw"
                className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="relative aspect-square w-full overflow-hidden rounded-[16px] border border-[#dfc2c0]/22 bg-[#f8f6f5]">
              <PlaceholderImage title={item.title} />
            </div>
          )}
        </Link>
        <div className="space-y-2">
          <Link href={item.href} className="inline-flex">
            <h3 className="text-[17px] leading-snug text-deep/88">{item.title}</h3>
          </Link>
          {item.secondaryText ? (
            <p className="line-clamp-2 text-[13px] leading-relaxed text-deep/68">{item.secondaryText}</p>
          ) : null}
        </div>
        <div className="mt-auto space-y-3">
          <p className="text-[13px] text-deep/60">{priceText}</p>
          {isPaid ? (
            <button type="button" onClick={handleAddToCart} className={primaryCtaClassName}>
              {ctaLabel}
            </button>
          ) : item.isFree ? (
            <Link href={item.href} className={primaryCtaClassName}>
              {ctaLabel}
            </Link>
          ) : (
            <button
              type="button"
              className={disabledPrimaryCtaClassName}
              disabled
              aria-disabled="true"
            >
              {ctaLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
