"use client";

import {useEffect, useMemo, useState} from "react";
import Image from "next/image";
import {ArrowRight, ShoppingCart, X} from "lucide-react";
import {useLocale} from "next-intl";
import {Link, useRouter} from "@/i18n/navigation";
import {useCart} from "@/components/cart/CartContext";
import EmptyCartCarousel from "@/components/cart/EmptyCartCarousel";
import {getProducts} from "@/content/products";
import {
  formatCurrency,
  getCartRecommendations,
  isFreeRecommendation,
  isPaidRecommendation,
  resolveCartItemsForLocale,
} from "@/components/cart/utils";
import type {Locale} from "@/i18n/routing";
import {trackEvent} from "@/lib/analytics";

export default function CartDrawer() {
  const router = useRouter();
  const locale = useLocale();
  const {items, isOpen, itemCount, removeItem, closeCart, addItem} = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);

  const isUkrainian = locale === "uk";
  const localizedProducts = useMemo(() => getProducts(locale as Locale), [locale]);
  const localizedItems = useMemo(
    () => resolveCartItemsForLocale(items, localizedProducts),
    [items, localizedProducts]
  );
  const recommendations = useMemo(
    () => getCartRecommendations(localizedItems, localizedProducts, 1),
    [localizedItems, localizedProducts]
  );

  const primaryCurrency = localizedItems[0]?.currency ?? "USD";
  const hasMixedCurrency = localizedItems.some((item) => item.currency !== primaryCurrency);
  const total = hasMixedCurrency
    ? null
    : localizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [closeCart, isOpen]);

  const handleCheckoutClick = () => {
    if (!localizedItems.length) {
      return;
    }
    trackEvent("checkout_cta_clicked", {
      source: "cart_drawer",
      cart_items: itemCount,
      cart_total: total ?? undefined,
      cart_currency: hasMixedCurrency ? undefined : primaryCurrency,
    });
    closeCart();
    router.push("/checkout");
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
      >
        <button
          type="button"
          aria-label={isUkrainian ? "Закрити кошик" : "Close cart"}
          onClick={closeCart}
          className={`absolute inset-0 bg-deep/25 backdrop-blur-[1px] transition-opacity ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={isUkrainian ? "Ваш кошик" : "Your cart"}
          className={`absolute right-0 top-0 h-full w-full max-w-[440px] border-l border-[#dfc2c0]/35 bg-[#fdf9f9] shadow-[-24px_0_54px_rgba(43,89,104,0.14)] transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-[#dfc2c0]/26 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[22px] text-deep/86">{isUkrainian ? "Ваш кошик" : "Your cart"}</h2>
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-[#dfc2c0]/34 bg-white/65 px-1.5 text-[10px] text-deep/60">
                  {itemCount}
                </span>
              </div>
              <button
                type="button"
                onClick={closeCart}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dfc2c0]/34 bg-white/68 text-deep/63 transition-colors hover:bg-white"
                aria-label={isUkrainian ? "Закрити" : "Close"}
              >
                <X size={15} />
              </button>
            </div>

            {localizedItems.length === 0 ? (
              <div className="flex flex-1 flex-col px-5 pt-10 pb-7 sm:px-6">
                <EmptyCartCarousel onNavigate={closeCart} />
              </div>
            ) : (
              <>
                <div className="flex-1 space-y-4 overflow-y-auto px-5 pt-6 pb-10 sm:px-6">
                  {localizedItems.map((item) => {
                    const linePrice = formatCurrency(item.price * item.quantity, item.currency, locale);

                    return (
                      <div key={item.slug} className="rounded-[22px] border border-[#dfc2c0]/24 bg-white/72 p-4">
                        <div className="flex items-start gap-4">
                          <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[16px] border border-[#dfc2c0]/24 bg-[#f7dce0]/22">
                            {item.imageSrc ? (
                              <Image
                                src={item.imageSrc}
                                alt={item.title}
                                width={72}
                                height={72}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.14em] text-deep/48">
                                TB
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <p className="pr-1 text-[15px] leading-5 text-deep/84">{item.title}</p>
                              <button
                                type="button"
                                onClick={() => removeItem(item.slug)}
                                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#dfc2c0]/30 bg-white/72 text-deep/52 transition-colors hover:bg-white hover:text-deep/76"
                                aria-label={isUkrainian ? "Видалити" : "Remove"}
                              >
                                <X size={13} />
                              </button>
                            </div>
                            <p className="mt-1 text-[12px] text-deep/54">
                              {isUkrainian ? "Шаблон Notion" : "Notion template"}
                            </p>
                            <p className="mt-2 text-[15px] text-deep/78">{linePrice}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {recommendations.length ? (
                    <section>
                      <h4 className="mb-3 text-[12px] uppercase tracking-[0.12em] text-deep/50">
                        {isUkrainian ? "Вам також може сподобатися" : "You may also like"}
                      </h4>
                      <div>
                        {recommendations.map((item) => {
                          const isFree = isFreeRecommendation(item);
                          const isPaid = isPaidRecommendation(item);
                          const paidPrice = item.price ?? 0;
                          const paidCurrency = item.currency ?? "USD";

                          return (
                            <div
                              key={item.slug}
                              className="flex items-center gap-3 rounded-[16px] border border-[#dfc2c0]/20 bg-[#fbf7f6] px-4 py-3"
                            >
                              <Link
                                href={`/products/${item.slug}`}
                                onClick={closeCart}
                                className="flex min-w-0 flex-1 items-center gap-3"
                              >
                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-[#dfc2c0]/22 bg-[#f7dce0]/16">
                                  <Image
                                    src={item.imageSrc}
                                    alt={item.title}
                                    width={56}
                                    height={56}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-[14px] text-deep/80">{item.title}</p>
                                  {isFree ? (
                                    <span className="mt-1 inline-flex rounded-full bg-[#f1e7e5] px-2 py-[2px] text-[11px] text-deep/60">
                                      {isUkrainian ? "Безкоштовно" : "Free"}
                                    </span>
                                  ) : isPaid ? (
                                    <p className="mt-1 text-[12px] text-deep/60">
                                      {formatCurrency(paidPrice, paidCurrency, locale)}
                                    </p>
                                  ) : (
                                    <p className="mt-1 text-[12px] text-deep/56">
                                      {item.priceLabel ?? (isUkrainian ? "Незабаром" : "Coming soon")}
                                    </p>
                                  )}
                                </div>
                              </Link>
                              {isFree ? (
                                <Link
                                  href={`/products/${item.slug}`}
                                  onClick={closeCart}
                                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#8fb8b3]/30 bg-[#a5c8c3]/30 text-[#2b5968]/70 transition hover:bg-[#8db8b3]/50"
                                  aria-label={isUkrainian ? "Відкрити продукт" : "Open product"}
                                >
                                  <ArrowRight size={16} />
                                </Link>
                              ) : isPaid ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    addItem({
                                      slug: item.slug,
                                      title: item.title,
                                      imageSrc: item.imageSrc,
                                      price: paidPrice,
                                      currency: paidCurrency,
                                    })
                                  }
                                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#8fb8b3]/30 bg-[#a5c8c3]/30 text-[#2b5968]/70 transition hover:bg-[#8db8b3]/50"
                                  aria-label={isUkrainian ? "Додати в кошик" : "Add to cart"}
                                >
                                  <ShoppingCart size={16} />
                                </button>
                              ) : (
                                <Link
                                  href={`/products/${item.slug}`}
                                  onClick={closeCart}
                                  className="ml-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#8fb8b3]/30 bg-[#a5c8c3]/30 text-[#2b5968]/70 transition hover:bg-[#8db8b3]/50"
                                  aria-label={isUkrainian ? "Відкрити продукт" : "Open product"}
                                >
                                  <ArrowRight size={16} />
                                </Link>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}
                </div>

                <div className="border-t border-[#dfc2c0]/26 bg-white/58 px-5 py-5 sm:px-6">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-deep/54">
                    {isUkrainian ? "Промокод" : "Promo / Coupon"}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <input
                      id="cart-promo-code"
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

                  <div className="mt-4 flex items-center justify-between text-[16px] text-deep/84">
                    <span>{isUkrainian ? "Разом" : "Total"}</span>
                    <span className="text-[18px] text-deep/88">
                      {total === null ? "—" : formatCurrency(total, primaryCurrency, locale)}
                    </span>
                  </div>
                  {isPromoApplied ? (
                    <div className="mt-1 text-[11px] text-deep/52">
                      {isUkrainian ? "Код застосовано ✓" : "Code applied ✓"}
                    </div>
                  ) : null}

                  <div className="mt-4 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleCheckoutClick}
                      className="inline-flex h-11 w-full items-center justify-center rounded-full bg-[#dfc2c0]/78 px-4 text-[14px] font-medium text-deep border border-[#dfc2c0]/55 transition-all duration-200 hover:bg-[#d7b7b4]/86 hover:-translate-y-[1px] hover:shadow-[0_6px_14px_rgba(223,194,192,0.22)]"
                    >
                      {isUkrainian ? "Оформлення" : "Checkout"}
                    </button>
                    <Link
                      href="/cart"
                      onClick={closeCart}
                      className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#dfc2c0]/42 bg-white/76 px-4 text-[14px] text-deep/72 transition-colors hover:bg-white"
                    >
                      {isUkrainian ? "Переглянути" : "View cart"}
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

    </>
  );
}
