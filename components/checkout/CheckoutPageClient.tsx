"use client";

import {useMemo, useState} from "react";
import Image from "next/image";
import {LockKeyhole} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import Container from "@/components/Container";
import CheckoutPlaceholderModal from "@/components/cart/CheckoutPlaceholderModal";
import {useCart} from "@/components/cart/CartContext";
import {formatCurrency, resolveCartItemsForLocale} from "@/components/cart/utils";
import {getProducts} from "@/content/products";
import type {Locale} from "@/i18n/routing";
import {trackEvent} from "@/lib/analytics";

type CheckoutPageClientProps = {
  initialProduct?: string;
};

const inputClassName =
  "h-11 w-full rounded-2xl border border-[#dfc2c0]/36 bg-white/88 px-4 text-[14px] text-deep/78 outline-none placeholder:text-deep/42 focus:border-[#d7b8b5]";

const cardLabelClassName = "mb-2 text-[11px] uppercase tracking-[0.14em] text-deep/56";

export default function CheckoutPageClient({initialProduct}: CheckoutPageClientProps) {
  const locale = useLocale();
  const t = useTranslations("Pages.checkout");
  const {items} = useCart();
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [isPromoApplied, setIsPromoApplied] = useState(false);
  const [isPlaceholderOpen, setIsPlaceholderOpen] = useState(false);

  const localizedProducts = useMemo(() => getProducts(locale as Locale), [locale]);
  const localizedItems = useMemo(
    () => resolveCartItemsForLocale(items, localizedProducts),
    [items, localizedProducts]
  );

  const fallbackItem = useMemo(() => {
    if (localizedItems.length || !initialProduct) {
      return null;
    }

    const normalized = decodeURIComponent(initialProduct).trim().toLowerCase();
    const matched = localizedProducts.find(
      (product) => product.slug === normalized || product.title.toLowerCase() === normalized
    );
    if (!matched) {
      return null;
    }

    const price =
      matched.purchase?.type === "paid" && typeof matched.purchase.price === "number"
        ? matched.purchase.price
        : 0;
    const currency = matched.purchase?.currency ?? "USD";

    return {
      slug: matched.slug,
      title: matched.title,
      subtitle: matched.shortDescription,
      imageSrc: matched.thumbnail ?? matched.mainPreviewImage?.src,
      price,
      currency,
      quantity: 1,
    };
  }, [initialProduct, localizedItems.length, localizedProducts]);

  const checkoutItems = localizedItems.length
    ? localizedItems
    : fallbackItem
      ? [fallbackItem]
      : [];

  const primaryCurrency = checkoutItems[0]?.currency ?? "USD";
  const hasMixedCurrency = checkoutItems.some((item) => item.currency !== primaryCurrency);
  const subtotal = hasMixedCurrency
    ? null
    : checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;
  const itemCount = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);

  const openPlaceholder = (method: "paypal" | "google_pay" | "card") => {
    trackEvent("checkout_cta_clicked", {
      source: "checkout_page",
      method,
      cart_items: itemCount,
      cart_total: total ?? undefined,
      cart_currency: hasMixedCurrency ? undefined : primaryCurrency,
    });
    setIsPlaceholderOpen(true);
  };

  return (
    <>
      <section className="bg-[#fbf3f4]">
        <Container className="py-14 md:py-16">
          <div className="mb-8 space-y-2">
            <h1 className="text-[30px] leading-[1.08] text-deep/90">{t("title")}</h1>
            <p className="text-[14px] text-deep/66">{t("description")}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-6">
              <section className="rounded-[26px] border border-[#dfc2c0]/28 bg-white/74 p-6 shadow-[0_10px_26px_rgba(43,89,104,0.05)]">
                <h2 className="text-[12px] uppercase tracking-[0.14em] text-deep/56">
                  {t("expressCheckout")}
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => openPlaceholder("paypal")}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-[#d5ad3f]/45 bg-[#ffc439] px-5 text-[14px] font-semibold text-[#1f2937] transition-colors hover:bg-[#f5bb2f]"
                  >
                    <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#003087] text-[10px] font-bold text-white">
                      P
                    </span>
                    <span>
                      <span className="font-bold text-[#003087]">Pay</span>
                      <span className="font-bold text-[#009cde]">Pal</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openPlaceholder("google_pay")}
                    className="inline-flex h-11 items-center justify-center rounded-2xl border border-black/40 bg-black px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
                  >
                    <span className="mr-2 inline-flex h-[18px] w-[18px] items-center justify-center" aria-hidden="true">
                      <svg viewBox="0 0 18 18" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fill="#4285F4"
                          d="M17.64 9.2045c0-.638-.0573-1.2518-.1636-1.8409H9v3.4818h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.715v2.2582h2.9086c1.7023-1.5677 2.6837-3.8741 2.6837-6.6141z"
                        />
                        <path
                          fill="#34A853"
                          d="M9 18c2.43 0 4.4673-.8068 5.9564-2.1818l-2.9086-2.2582c-.8068.54-1.8409.8591-3.0478.8591-2.3441 0-4.3282-1.5832-5.0364-3.7091H.9573v2.3327C2.4382 15.9832 5.4818 18 9 18z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M3.9636 10.7091c-.18-.54-.2836-1.1168-.2836-1.7091s.1036-1.1691.2836-1.7091V4.9582H.9573C.3477 6.1732 0 7.5505 0 9s.3477 2.8268.9573 4.0418l3.0063-2.3327z"
                        />
                        <path
                          fill="#EA4335"
                          d="M9 3.5809c1.3214 0 2.5077.4541 3.4405 1.3459l2.5814-2.5814C13.4632.8918 11.43 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582l3.0063 2.3327C4.6718 5.1641 6.6559 3.5809 9 3.5809z"
                        />
                      </svg>
                    </span>
                    <span className="font-medium text-white">Pay</span>
                  </button>
                </div>
              </section>

              <section className="rounded-[26px] border border-[#dfc2c0]/28 bg-white/74 p-6 shadow-[0_10px_26px_rgba(43,89,104,0.05)]">
                <h2 className="text-[12px] uppercase tracking-[0.14em] text-deep/56">{t("contact")}</h2>
                <div className="mt-4">
                  <label className={cardLabelClassName} htmlFor="checkout-email">
                    {t("email")}
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={t("emailPlaceholder")}
                    className={inputClassName}
                  />
                  <p className="mt-2 text-[12px] text-deep/56">{t("emailHelper")}</p>
                </div>
              </section>

              <section className="rounded-[26px] border border-[#dfc2c0]/28 bg-white/74 p-6 shadow-[0_10px_26px_rgba(43,89,104,0.05)]">
                <h2 className="text-[12px] uppercase tracking-[0.14em] text-deep/56">{t("payment")}</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className={cardLabelClassName} htmlFor="checkout-card-number">
                      {t("cardNumber")}
                    </label>
                    <input
                      id="checkout-card-number"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      value={cardNumber}
                      onChange={(event) => setCardNumber(event.target.value)}
                      placeholder={t("cardNumberPlaceholder")}
                      className={inputClassName}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={cardLabelClassName} htmlFor="checkout-expiry">
                        {t("expirationDate")}
                      </label>
                      <input
                        id="checkout-expiry"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={expiry}
                        onChange={(event) => setExpiry(event.target.value)}
                        placeholder={t("expirationDatePlaceholder")}
                        className={inputClassName}
                      />
                    </div>
                    <div>
                      <label className={cardLabelClassName} htmlFor="checkout-cvc">
                        {t("securityCode")}
                      </label>
                      <input
                        id="checkout-cvc"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={cvc}
                        onChange={(event) => setCvc(event.target.value)}
                        placeholder={t("securityCodePlaceholder")}
                        className={inputClassName}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={cardLabelClassName} htmlFor="checkout-card-name">
                      {t("nameOnCard")}
                    </label>
                    <input
                      id="checkout-card-name"
                      type="text"
                      autoComplete="cc-name"
                      value={cardName}
                      onChange={(event) => setCardName(event.target.value)}
                      placeholder={t("nameOnCardPlaceholder")}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openPlaceholder("card")}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-6 text-[15px] font-medium text-deep transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#d7b7b4]/86 hover:shadow-[0_6px_14px_rgba(223,194,192,0.22)]"
                >
                  {t("continueToSecurePayment")}
                </button>
                <p className="mt-3 inline-flex items-center text-[12px] text-deep/54">
                  <LockKeyhole size={12} className="mr-1.5" />
                  {t("secureCheckout")}
                </p>
              </section>
            </div>

            <aside className="h-fit rounded-[26px] border border-[#dfc2c0]/28 bg-white/74 p-6 shadow-[0_10px_26px_rgba(43,89,104,0.05)]">
              <h2 className="text-[12px] uppercase tracking-[0.14em] text-deep/56">
                {t("orderSummary")}
              </h2>

              <div className="mt-4 space-y-4">
                {checkoutItems.length ? (
                  checkoutItems.map((item) => (
                    <div key={item.slug} className="flex items-start gap-3">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-[14px] border border-[#dfc2c0]/24 bg-[#f7dce0]/20">
                        {item.imageSrc ? (
                          <Image
                            src={item.imageSrc}
                            alt={item.title}
                            width={56}
                            height={56}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[11px] uppercase tracking-[0.12em] text-deep/45">
                            TB
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] text-deep/84">{item.title}</p>
                        <p className="mt-1 text-[12px] text-deep/54">{t("digitalProduct")}</p>
                      </div>
                      <p className="text-[14px] text-deep/74">
                        {formatCurrency(item.price * item.quantity, item.currency, locale)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[13px] text-deep/60">{t("emptyCart")}</p>
                )}
              </div>

              <div className="mt-5 border-t border-[#dfc2c0]/24 pt-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-deep/56">
                  {t("promoCoupon")}
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
                    placeholder={t("enterCode")}
                    className="h-10 flex-1 rounded-full border border-[#dfc2c0]/40 bg-white px-4 text-sm text-deep/72 outline-none placeholder:text-deep/40 focus:border-[#d7b8b5]"
                  />
                  <button
                    type="button"
                    onClick={() => setIsPromoApplied(Boolean(promoCode.trim()))}
                    className="rounded-full border border-[#dfc2c0]/40 px-4 py-2 text-sm text-deep/70 transition hover:bg-[#f5e9e7]"
                  >
                    {t("apply")}
                  </button>
                </div>
                {isPromoApplied ? (
                  <p className="mt-2 text-[11px] text-deep/52">{t("codeApplied")}</p>
                ) : null}
              </div>

              <div className="mt-5 space-y-2 border-t border-[#dfc2c0]/24 pt-5 text-[14px] text-deep/74">
                <div className="flex items-center justify-between">
                  <span>{t("subtotal")}</span>
                  <span>
                    {subtotal === null ? t("notAvailable") : formatCurrency(subtotal, primaryCurrency, locale)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[16px] text-deep/86">
                  <span>{t("total")}</span>
                  <span>{total === null ? t("notAvailable") : formatCurrency(total, primaryCurrency, locale)}</span>
                </div>
                <p className="pt-1 text-[12px] text-deep/56">{t("oneTimePurchase")}</p>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <CheckoutPlaceholderModal
        open={isPlaceholderOpen}
        onClose={() => setIsPlaceholderOpen(false)}
        source="checkout_page_modal"
        itemCount={itemCount || 1}
      />
    </>
  );
}
