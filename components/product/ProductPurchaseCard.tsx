"use client";

import {useEffect} from "react";
import {useLocale} from "next-intl";
import {useCart} from "@/components/cart/CartContext";
import {formatCurrency} from "@/components/cart/utils";
import type {ProductConfig, ProductPurchaseConfig} from "@/content/products";
import {trackEvent} from "@/lib/analytics";

type ProductPurchaseCardProps = {
  product: Pick<ProductConfig, "slug" | "title" | "priceLabel" | "shortDescription" | "thumbnail">;
  purchase: ProductPurchaseConfig;
};

export default function ProductPurchaseCard({product, purchase}: ProductPurchaseCardProps) {
  const locale = useLocale();
  const {addItem} = useCart();
  const checkoutEnabled = Boolean(purchase.checkoutEnabled);
  const checkoutMode = purchase.checkoutMode ?? "modal";
  const priceValue = typeof purchase.price === "number" ? purchase.price : 0;
  const currency = purchase.currency ?? "USD";
  const priceText =
    typeof purchase.price === "number"
      ? formatCurrency(purchase.price, currency, locale)
      : product.priceLabel;

  useEffect(() => {
    trackEvent("checkout_block_viewed", {
      product_slug: product.slug,
      product_name: product.title,
      checkout_enabled: checkoutEnabled,
      checkout_mode: checkoutMode,
      page_type: "product",
    });
  }, [checkoutEnabled, checkoutMode, product.slug, product.title]);

  const handleAddToCart = () => {
    trackEvent("checkout_cta_clicked", {
      product_slug: product.slug,
      product_name: product.title,
      checkout_enabled: checkoutEnabled,
      checkout_mode: checkoutMode,
      cta_type: "add_to_cart",
      page_type: "product",
    });

    addItem({
      slug: product.slug,
      title: product.title,
      subtitle: product.shortDescription,
      imageSrc: product.thumbnail,
      price: priceValue,
      currency,
    });
  };

  return (
    <div className="rounded-[24px] border border-[#dfc2c0]/30 bg-[#fffdfc] p-4 sm:p-5 shadow-[0_10px_24px_rgba(43,89,104,0.06)]">
      <p className="text-[11px] uppercase tracking-[0.2em] text-deep/56">One-time purchase</p>
      <div className="mt-3 flex items-center gap-3">
        <div className="inline-flex h-12 min-w-[94px] items-center justify-center rounded-full border border-[#dfc2c0]/36 bg-white/82 px-4 text-[21px] text-deep/84">
          {priceText}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#dfc2c0]/75 px-6 text-[15px] font-medium text-deep border border-[#dfc2c0]/50 transition-all duration-200 hover:bg-[#d7b7b4]/85 hover:-translate-y-[1px] hover:shadow-[0_6px_14px_rgba(223,194,192,0.22)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(223,194,192,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9]"
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
