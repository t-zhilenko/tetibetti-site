"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CheckoutResultClientProps = {
  locale: "en" | "uk";
  orderId: string | null;
};

type OrderStatusResponse =
  | {
      ok: true;
      orderId: string;
      status: "initiated" | "processing" | "paid" | "failed" | "expired" | "manual_review";
      productSlug: string;
      email: string;
      paymentProvider: string | null;
      providerInvoiceId: string | null;
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

type UiState = "paid" | "pending" | "failed";
type KnownOrderStatus = "initiated" | "processing" | "paid" | "failed" | "expired" | "manual_review";

const COPY = {
  en: {
    invalidOrder: "Order ID is missing or invalid.",
    loading: "Checking payment status...",
    loadFailed: "Unable to load payment status right now.",
    paidTitle: "Payment successful",
    paidMessage: "Your access email has been sent.",
    pendingTitle: "Payment is being confirmed",
    pendingMessage: "This can take a moment.",
    failedTitle: "Payment was not completed",
    failedMessage: "Try again or contact support.",
    orderIdLabel: "Order ID",
    checkAgain: "Check status again",
    resendAccess: "Resend access",
    returnToProduct: "Return to product",
    returnToShop: "Return to shop",
  },
  uk: {
    invalidOrder: "ID замовлення відсутній або некоректний.",
    loading: "Перевіряємо статус оплати...",
    loadFailed: "Зараз не вдалося перевірити статус оплати.",
    paidTitle: "Оплата успішна",
    paidMessage: "Лист із доступом уже надіслано.",
    pendingTitle: "Платіж підтверджується",
    pendingMessage: "Це може зайняти трохи часу.",
    failedTitle: "Оплату не завершено",
    failedMessage: "Спробуйте ще раз або зверніться в підтримку.",
    orderIdLabel: "ID замовлення",
    checkAgain: "Перевірити статус ще раз",
    resendAccess: "Надіслати доступ повторно",
    returnToProduct: "Повернутися до продукту",
    returnToShop: "Повернутися до магазину",
  },
} as const;

const mapOrderStatusToUiState = (
  status: KnownOrderStatus,
): UiState => {
  if (status === "paid") {
    return "paid";
  }
  if (status === "failed" || status === "expired" || status === "manual_review") {
    return "failed";
  }
  return "pending";
};

export default function CheckoutResultClient({ locale, orderId }: CheckoutResultClientProps) {
  const [isLoading, setIsLoading] = useState(Boolean(orderId));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<OrderStatusResponse | null>(null);
  const t = COPY[locale];

  const fetchStatus = useCallback(async () => {
    if (!orderId) {
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId)}`, {
        method: "GET",
        cache: "no-store",
      });

      const body = (await response.json()) as OrderStatusResponse;
      if (!response.ok || !body.ok) {
        setData(body);
        setLoadError(t.loadFailed);
        return;
      }

      setData(body);
    } catch {
      setLoadError(t.loadFailed);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, t.loadFailed]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const uiState = useMemo(() => {
    if (!data || !("ok" in data) || !data.ok) {
      return "pending" as UiState;
    }
    return mapOrderStatusToUiState(data.status);
  }, [data]);

  const productLink =
    data && "ok" in data && data.ok ? `/${locale}/products/${data.productSlug}` : `/${locale}/shop`;
  const orderLookupLink = orderId
    ? `/${locale}/order/lookup?orderId=${encodeURIComponent(orderId)}`
    : `/${locale}/order/lookup`;

  if (!orderId) {
    return <p className="text-sm text-[#9f4d4d]">{t.invalidOrder}</p>;
  }

  if (isLoading && !data) {
    return <p className="text-sm text-deep/70">{t.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl text-deep/90">
          {uiState === "paid"
            ? t.paidTitle
            : uiState === "failed"
              ? t.failedTitle
              : t.pendingTitle}
        </h1>
        <p className="text-sm text-deep/70">
          {uiState === "paid"
            ? t.paidMessage
            : uiState === "failed"
              ? t.failedMessage
              : t.pendingMessage}
        </p>
        <p className="text-xs text-deep/55">
          {t.orderIdLabel}: {orderId}
        </p>
      </div>

      {loadError ? <p className="text-sm text-[#9f4d4d]">{loadError}</p> : null}

      <div className="flex flex-wrap gap-3">
        {uiState === "paid" ? (
          <Link
            href={orderLookupLink}
            className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep"
          >
            {t.resendAccess}
          </Link>
        ) : null}

        {uiState === "pending" ? (
          <button
            type="button"
            onClick={() => void fetchStatus()}
            className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep"
          >
            {t.checkAgain}
          </button>
        ) : null}

        {uiState === "failed" ? (
          <Link
            href={data && "ok" in data && data.ok ? productLink : `/${locale}/shop`}
            className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/50 px-5 text-sm text-deep/80"
          >
            {data && "ok" in data && data.ok ? t.returnToProduct : t.returnToShop}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
