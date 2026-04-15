"use client";

import {useMemo, useState} from "react";
import Image from "next/image";
import {X} from "lucide-react";
import {useLocale} from "next-intl";
import Container from "@/components/Container";
import ProductCarousel from "@/components/ProductCarousel";
import {toProductCardItem} from "@/components/product-card-data";
import {VIEW_ALL_BUTTON_CLASS} from "@/components/view-all-button-class";
import {useCart} from "@/components/cart/CartContext";
import {getProducts} from "@/content/products";
import {
  formatCurrency,
  getCartRecommendedProducts,
  resolveCartItemsForLocale,
} from "@/components/cart/utils";
import {Link, useRouter} from "@/i18n/navigation";
import type {Locale} from "@/i18n/routing";
import {trackEvent} from "@/lib/analytics";

export default function CartPageClient() {
  const router = useRouter();
  const locale = useLocale();
  const {items, itemCount, removeItem} = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const isUkrainian = locale === "uk";

  const localizedProducts = useMemo(() => getProducts(locale as Locale), [locale]);
  const localizedItems = useMemo(
    () => resolveCartItemsForLocale(items, localizedProducts),
    [items, localizedProducts]
  );
  const recommendedProducts = useMemo(
    () => getCartRecommendedProducts(localizedItems, localizedProducts, 4),
    [localizedItems, localizedProducts]
  );
  const recommendationItems = useMemo(
    () => recommendedProducts.map((product) => toProductCardItem(product)),
    [recommendedProducts]
  );

  const primaryCurrency = localizedItems[0]?.currency ?? "USD";
  const hasMixedCurrency = localizedItems.some((item) => item.currency !== primaryCurrency);
  const total = hasMixedCurrency
    ? null
    : localizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckoutClick = () => {
    if (!localizedItems.length) {
      return;
    }
    trackEvent("checkout_cta_clicked", {
      source: "cart_page",
      cart_items: itemCount,
      cart_total: total ?? undefined,
      cart_currency: hasMixedCurrency ? undefined : primaryCurrency,
    });
    router.push("/checkout");
  };

  return (
    <>
      <section className="bg-[#fbf3f4]">
        <Container className="py-16 md:py-20">
          <h1 className="text-[34px] leading-[1.05] text-deep/90">
            {isUkrainian ? "Ваш кошик" : "Your cart"}
          </h1>

          {!localizedItems.length ? (
            <div className="mt-8 rounded-[28px] border border-[#dfc2c0]/30 bg-white/66 p-7 shadow-[0_10px_28px_rgba(43,89,104,0.06)]">
              <p className="text-[18px] text-deep/82">
                {isUkrainian ? "Ваш кошик зараз порожній." : "Your cart is currently empty."}
              </p>
              <p className="mt-2 text-[14px] text-deep/62">
                {isUkrainian
                  ? "Додайте продукт зі сторінки магазину, щоб продовжити."
                  : "Add a product from the shop to continue."}
              </p>
              <Link
                href="/shop"
                className="mt-5 inline-flex h-11 items-center justify-center rounded-full border border-[#dfc2c0]/42 bg-white/76 px-6 text-[14px] text-deep/72 transition-colors hover:bg-white"
              >
                {isUkrainian ? "Перейти до магазину" : "Go to shop"}
              </Link>
            </div>
          ) : (
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.8fr_1fr]">
              <div className="overflow-hidden rounded-[28px] border border-[#dfc2c0]/28 bg-white/68 shadow-[0_10px_26px_rgba(43,89,104,0.06)]">
                <div className="hidden grid-cols-[minmax(0,1fr)_96px_40px] gap-6 border-b border-[#dfc2c0]/24 px-6 py-4 text-[11px] uppercase tracking-[0.14em] text-deep/52 md:grid">
                  <span>{isUkrainian ? "Продукт" : "Product"}</span>
                  <span className="text-center">{isUkrainian ? "Ціна" : "Price"}</span>
                  <span aria-hidden="true" />
                </div>
                <div className="divide-y divide-[#dfc2c0]/20">
                  {localizedItems.map((item) => {
                    const price = formatCurrency(item.price, item.currency, locale);

                    return (
                      <div
                        key={item.slug}
                        className="grid gap-6 px-6 py-5 md:grid-cols-[minmax(0,1fr)_96px_40px] md:items-center"
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-[66px] w-[66px] shrink-0 overflow-hidden rounded-[15px] border border-[#dfc2c0]/24 bg-[#f7dce0]/20">
                            {item.imageSrc ? (
                              <Image
                                src={item.imageSrc}
                                alt={item.title}
                                width={66}
                                height={66}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.12em] text-deep/45">
                                TB
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-[15px] leading-5 text-deep/84">{item.title}</p>
                              <button
                                type="button"
                                onClick={() => removeItem(item.slug)}
                                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#dfc2c0]/30 bg-white/72 text-deep/52 transition-colors hover:bg-white hover:text-deep/76 md:hidden"
                                aria-label={isUkrainian ? "Видалити" : "Remove"}
                              >
                                <X size={13} />
                              </button>
                            </div>
                            <p className="mt-1 text-[12px] text-deep/54">
                              {isUkrainian ? "Шаблон Notion" : "Notion template"}
                            </p>
                            <p className="mt-2 text-[13px] text-deep/62 md:hidden">{price}</p>
                          </div>
                        </div>
                        <p className="hidden text-center text-[14px] text-deep/74 md:block">{price}</p>
                        <div className="hidden md:flex md:justify-end">
                          <button
                            type="button"
                            onClick={() => removeItem(item.slug)}
                            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#dfc2c0]/30 bg-white/72 text-deep/52 transition-colors hover:bg-white hover:text-deep/76"
                            aria-label={isUkrainian ? "Видалити" : "Remove"}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <aside className="h-fit rounded-[28px] border border-[#dfc2c0]/28 bg-white/68 p-6 shadow-[0_10px_26px_rgba(43,89,104,0.06)]">
                <p className="text-[11px] uppercase tracking-[0.14em] text-deep/52">
                  {isUkrainian ? "Промокод" : "Promo / Coupon"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(event.target.value);
                      if (isPromoApplied) {
                        setIsPromoApplied(false);
                      }
                    }}
                    placeholder={isUkrainian ? "Введіть код" : "Enter code"}
                    className="h-10 flex-1 rounded-full border border-[#dfc2c0]/40 bg-white px-4 text-sm text-deep/72 outline-none placeholder:text-deep/40 focus:border-[#d7b8b5]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPromoApplied(Boolean(promoCode.trim()))}
                    className="rounded-full border border-[#dfc2c0]/40 px-4 py-2 text-sm text-deep/70 transition hover:bg-[#f5e9e7]"
                  >
                    {isUkrainian ? "Застосувати" : "Apply"}
                  </button>
                </div>

                <div className="mt-5 flex items-center justify-between text-[16px] text-deep/84">
                  <span>{isUkrainian ? "Орієнтовна сума" : "Estimated total"}</span>
                  <span className="text-[20px] text-deep/88">
                    {total === null ? "—" : formatCurrency(total, primaryCurrency, locale)}
                  </span>
                </div>
                {isPromoApplied ? (
                  <p className="mt-1 text-[11px] text-deep/52">
                    {isUkrainian ? "Код застосовано ✓" : "Code applied ✓"}
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={handleCheckoutClick}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-6 text-[15px] font-medium text-deep transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#d7b7b4]/86 hover:shadow-[0_6px_14px_rgba(223,194,192,0.22)]"
                >
                  {isUkrainian ? "Оформити замовлення" : "Checkout"}
                </button>
                <Link
                  href="/shop"
                  className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-[#dfc2c0]/42 bg-white/76 px-6 text-[14px] text-deep/72 transition-colors hover:bg-white"
                >
                  {isUkrainian ? "Продовжити покупки" : "Continue shopping"}
                </Link>
              </aside>
            </div>
          )}

          {recommendationItems.length ? (
            <section className="mt-14">
              <ProductCarousel
                products={recommendationItems}
                title={isUkrainian ? "Вам також може сподобатися" : "You may also like"}
                titleClassName="text-[16px] uppercase tracking-[0.14em] text-deep/55"
                showViewAll
                viewAllLabel={isUkrainian ? "Переглянути всі" : "View all"}
                viewAllClassName={VIEW_ALL_BUTTON_CLASS}
                showArrows={false}
              />
            </section>
          ) : null}
        </Container>
      </section>

    </>
  );
}
