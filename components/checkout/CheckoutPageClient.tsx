"use client";

import {useMemo, useState} from "react";
import Image from "next/image";
import {LockKeyhole} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import Container from "@/components/Container";
import {useCart} from "@/components/cart/CartContext";
import {formatCurrency, resolveCartItemsForLocale} from "@/components/cart/utils";
import {getProducts} from "@/content/products";
import type {Locale} from "@/i18n/routing";
import {trackEvent} from "@/lib/analytics";

type CheckoutPageClientProps = {
  initialProduct?: string;
};

type CreateOrderApiResponse =
  | {
      ok: true;
      flow: "free";
      orderId: string;
    }
  | {
      ok: true;
      flow: "paid";
      orderId: string;
      paymentAttemptId: string;
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

type StartPaymentApiResponse =
  | {
      ok: true;
      orderId?: string;
      paymentUrl?: string;
      checkout: {
        provider: "fondy" | "mono";
        method: "redirect" | "form_post";
        checkoutUrl?: string;
        action?: string;
        fields?: Record<string, string>;
      };
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClassName =
  "h-11 w-full rounded-2xl border border-[#dfc2c0]/36 bg-white/88 px-4 text-[14px] text-deep/78 outline-none placeholder:text-deep/42 focus:border-[#d7b8b5]";

const cardLabelClassName = "text-[11px] uppercase tracking-[0.14em] text-deep/56";

type CheckoutPhase =
  | "idle"
  | "validating"
  | "creating_order"
  | "starting_payment"
  | "redirecting"
  | "error";

const getCheckoutPhaseMessage = (
  phase: CheckoutPhase,
  t: (key: "phaseValidating" | "phaseCreatingOrder" | "phaseStartingPayment" | "phaseRedirecting") => string,
): string => {
  switch (phase) {
    case "validating":
      return t("phaseValidating");
    case "creating_order":
      return t("phaseCreatingOrder");
    case "starting_payment":
      return t("phaseStartingPayment");
    case "redirecting":
      return t("phaseRedirecting");
    default:
      return "";
  }
};

export default function CheckoutPageClient({initialProduct}: CheckoutPageClientProps) {
  const locale = useLocale();
  const t = useTranslations("Pages.checkout");
  const {items} = useCart();
  const [email, setEmail] = useState("");
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState<{
    orderId: string;
    email: string;
    productSlug: string;
  } | null>(null);
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>("idle");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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
  const checkoutItem = checkoutItems[0] ?? null;
  const checkoutItemProduct = checkoutItem
    ? localizedProducts.find((product) => product.slug === checkoutItem.slug) ?? null
    : null;
  const checkoutItemFlowType =
    checkoutItemProduct?.purchase?.type ?? (checkoutItem && checkoutItem.price > 0 ? "paid" : "free");
  const isPaidCheckout = checkoutItemFlowType === "paid";
  const isWaitlistCheckout = checkoutItemFlowType === "waitlist";
  const isFreeCheckout = checkoutItemFlowType === "free";
  const productUrl = checkoutItem ? `/${locale}/products/${checkoutItem.slug}` : `/${locale}/shop`;
  const isCheckoutBusy = !["idle", "error"].includes(checkoutPhase);
  const isCheckoutBlocked = !checkoutItem || hasMixedCurrency || !isPaidCheckout;
  const checkoutProgressMessage = getCheckoutPhaseMessage(checkoutPhase, t);

  const submitFormPostRedirect = (action: string, fields: Record<string, string>) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = action;

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  const handleSecureCheckout = async () => {
    if (!checkoutItem) {
      setCheckoutPhase("error");
      setCheckoutError(t("errorCartEmptyStart"));
      return;
    }

    if (hasMixedCurrency) {
      setCheckoutPhase("error");
      setCheckoutError(t("errorSingleCurrencyOnly"));
      return;
    }

    if (!isPaidCheckout) {
      setCheckoutPhase("error");
      setCheckoutError(
        isWaitlistCheckout
          ? t("errorWaitlistNotPurchasable")
          : t("errorFreeFlowFromProductPage"),
      );
      return;
    }

    setCheckoutPhase("validating");
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalizedEmail)) {
      setCheckoutPhase("error");
      setCheckoutError(t("errorInvalidEmail"));
      return;
    }

    setCheckoutError(null);
    trackEvent("checkout_cta_clicked", {
      source: "checkout_page",
      method: "payment_redirect",
      cart_items: itemCount,
      cart_total: total ?? undefined,
      cart_currency: hasMixedCurrency ? undefined : primaryCurrency,
    });

    try {
      let orderIdForPayment =
        pendingPaymentOrder &&
        pendingPaymentOrder.email === normalizedEmail &&
        pendingPaymentOrder.productSlug === checkoutItem.slug
          ? pendingPaymentOrder.orderId
          : null;

      if (!orderIdForPayment) {
        setCheckoutPhase("creating_order");
        const createOrderResponse = await fetch("/api/checkout/create-order", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            productSlug: checkoutItem.slug,
          }),
        });

        const createOrderBody = (await createOrderResponse.json()) as CreateOrderApiResponse;
        if (!createOrderResponse.ok || !createOrderBody.ok) {
          const message =
            "message" in createOrderBody ? createOrderBody.message : undefined;
          setCheckoutPhase("error");
          setCheckoutError(message ?? t("errorCreateOrder"));
          return;
        }

        if (createOrderBody.flow !== "paid") {
          setCheckoutPhase("error");
          setCheckoutError(
            createOrderBody.flow === "free"
              ? t("errorFreeFlowFromProductPage")
              : t("errorProductNotAvailableForPayment"),
          );
          setPendingPaymentOrder(null);
          return;
        }

        orderIdForPayment = createOrderBody.orderId;
        setPendingPaymentOrder({
          orderId: orderIdForPayment,
          email: normalizedEmail,
          productSlug: checkoutItem.slug,
        });
      }

      setCheckoutPhase("starting_payment");
      const startPaymentResponse = await fetch("/api/checkout/start-payment", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          orderId: orderIdForPayment,
          locale,
        }),
      });

      const startPaymentBody = (await startPaymentResponse.json()) as StartPaymentApiResponse;
      if (!startPaymentResponse.ok || !startPaymentBody.ok) {
        const message =
          "message" in startPaymentBody ? startPaymentBody.message : undefined;
        if (startPaymentResponse.status === 404 || startPaymentResponse.status === 409) {
          setPendingPaymentOrder(null);
        }
        setCheckoutPhase("error");
        setCheckoutError(message ?? t("errorStartPayment"));
        return;
      }

      const redirectUrl =
        "paymentUrl" in startPaymentBody && typeof startPaymentBody.paymentUrl === "string"
          ? startPaymentBody.paymentUrl
          : startPaymentBody.checkout.method === "redirect"
            ? startPaymentBody.checkout.checkoutUrl
            : undefined;

      if (redirectUrl) {
        setPendingPaymentOrder(null);
        setCheckoutPhase("redirecting");
        window.location.assign(redirectUrl);
        return;
      }

      if (
        startPaymentBody.checkout.method === "form_post" &&
        startPaymentBody.checkout.action &&
        startPaymentBody.checkout.fields
      ) {
        setPendingPaymentOrder(null);
        setCheckoutPhase("redirecting");
        submitFormPostRedirect(
          startPaymentBody.checkout.action,
          startPaymentBody.checkout.fields,
        );
        return;
      }

      setCheckoutPhase("error");
      setCheckoutError(t("errorInvalidCheckoutResponse"));
    } catch {
      setCheckoutPhase("error");
      setCheckoutError(t("errorStartCheckoutTryAgain"));
    }
  };

  return (
    <>
      <section className="bg-[#fbf3f4]">
        <Container className="px-4 pt-12 pb-16 sm:px-6 md:pt-14 md:pb-20 lg:px-8">
          <div className="mb-8 md:mb-10">
            <h1 className="mb-2 text-[30px] leading-[1.08] text-deep/90">{t("title")}</h1>
            <p className="text-[14px] text-deep/66">{t("description")}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_380px] md:gap-10">
            <div className="min-w-0">
              <section className="rounded-[26px] border border-[#dfc2c0]/28 bg-white/74 p-6 shadow-[0_10px_26px_rgba(43,89,104,0.05)] md:p-7">
                <p className="text-[13px] text-deep/62">
                  {t("enterEmailToContinue")}
                </p>

                <div className="mt-5">
                  <label className={cardLabelClassName} htmlFor="checkout-email">
                    {t("email")}
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (pendingPaymentOrder) {
                        setPendingPaymentOrder(null);
                      }
                    }}
                    placeholder={t("emailPlaceholder")}
                    className={`mt-2 ${inputClassName}`}
                  />
                  <p className="mt-2 text-[12px] text-deep/56">{t("emailAccessLinkHelper")}</p>
                </div>

                {isPaidCheckout ? (
                  <button
                    type="button"
                    onClick={handleSecureCheckout}
                    disabled={isCheckoutBusy || isCheckoutBlocked}
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-6 text-[15px] font-medium text-deep transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#d7b7b4]/86 hover:shadow-[0_6px_14px_rgba(223,194,192,0.22)] disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {isCheckoutBusy ? checkoutProgressMessage : t("continueToSecurePayment")}
                  </button>
                ) : (
                  <a
                    href={productUrl}
                    className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-6 text-[15px] font-medium text-deep transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#d7b7b4]/86 hover:shadow-[0_6px_14px_rgba(223,194,192,0.22)]"
                  >
                    {isWaitlistCheckout
                      ? t("goToProductWaitlist")
                      : isFreeCheckout
                        ? t("goToFreeProductFlow")
                        : t("choosePayableProduct")}
                  </a>
                )}

                <p className="mt-4 inline-flex items-center text-[12px] text-deep/54">
                  <LockKeyhole size={12} className="mr-1.5" />
                  {locale === "uk"
                    ? "Оплата відбудеться на захищеній сторінці MonoPay. Доступ надійде на email."
                    : "You'll complete payment on a secure MonoPay page. Access is delivered by email."}
                </p>

                {!isPaidCheckout ? (
                  <p className="mt-2 text-[12px] text-deep/56">
                    {t("paidCheckoutOnlyNote")}
                  </p>
                ) : null}
                {hasMixedCurrency ? (
                  <p className="mt-2 text-[12px] text-[#9f4d4d]">
                    {t("mixedCurrencyInlineNote")}
                  </p>
                ) : null}
                {checkoutError ? (
                  <p className="mt-2 text-[12px] text-[#9f4d4d]">{checkoutError}</p>
                ) : null}
              </section>
            </div>

            <aside className="h-fit rounded-[26px] border border-[#dfc2c0]/28 bg-white/74 p-5 shadow-[0_10px_26px_rgba(43,89,104,0.05)] md:p-6">
              <h2 className="text-[12px] uppercase tracking-[0.14em] text-deep/56">
                {t("orderSummary")}
              </h2>

              <div className="mt-3 space-y-4">
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

              <div className="mt-4 space-y-2 border-t border-[#dfc2c0]/24 pt-4 text-[14px] text-deep/74">
                <div className="flex items-center justify-between">
                  <span>{t("subtotal")}</span>
                  <span>
                    {subtotal === null ? "-" : formatCurrency(subtotal, primaryCurrency, locale)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[16px] text-deep/86">
                  <span>{t("total")}</span>
                  <span>{total === null ? "-" : formatCurrency(total, primaryCurrency, locale)}</span>
                </div>
                <p className="pt-1 text-[12px] text-deep/56">{t("oneTimePurchase")}</p>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
