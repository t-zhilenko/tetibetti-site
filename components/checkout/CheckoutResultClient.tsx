"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import Modal from "@/components/Modal";
import SupportForm from "@/components/SupportForm";

type CheckoutResultClientProps = {
  locale: "en" | "uk";
  orderId: string | null;
  copy: CheckoutResultCopy;
};

type OrderStatusSuccessResponse = {
  ok: true;
  orderId: string;
  status: "initiated" | "processing" | "paid" | "failed" | "expired" | "manual_review";
  deliveryStatus: "pending" | "sent" | "delivery_failed" | null;
  emailMasked: string;
  supportPrefillEmail: string;
  productName: string;
  productSlug: string;
  paymentProvider: string | null;
  canResendAccess?: boolean;
};

type OrderStatusResponse =
  | OrderStatusSuccessResponse
  | {
      ok: false;
      code?: string;
      message?: string;
    };

type ResendAccessResponse =
  | {
      ok: true;
      orderId: string;
      status: string;
      message: string;
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

type UiState = "paid" | "pending" | "failed";
type KnownOrderStatus = "initiated" | "processing" | "paid" | "failed" | "expired" | "manual_review";

export type CheckoutResultCopy = {
  invalidOrder: string;
  loading: string;
  loadFailed: string;
  paidTitle: string;
  paidMessage: string;
  paidSecondary: string;
  pendingTitle: string;
  pendingMessage: string;
  pendingSecondary: string;
  failedTitle: string;
  failedMessage: string;
  orderIdLabel: string;
  resendEmail: string;
  resendingEmail: string;
  resendSuccess: string;
  resendErrorGeneric: string;
  resendErrorUnavailable: string;
  resendErrorRateLimited: string;
  resendErrorOrderUnpaid: string;
  resendErrorDeliveryFailed: string;
  resendErrorCooldown: string;
  refreshStatus: string;
  refreshingStatus: string;
  contactSupport: string;
  supportModalTitle: string;
  supportClose: string;
  returnToProduct: string;
  returnToShop: string;
  supportSubjectTemplate: string;
  supportBodyTemplate: string;
};

const AUTO_REFRESH_INTERVAL_MS = 4_000;
const AUTO_REFRESH_MAX_ATTEMPTS = 8;
const CART_STORAGE_KEY = "tetibetti_cart_v1";

const mapOrderStatusToUiState = (status: KnownOrderStatus): UiState => {
  if (status === "paid") {
    return "paid";
  }
  if (status === "failed" || status === "expired" || status === "manual_review") {
    return "failed";
  }
  return "pending";
};

const isSuccessResponse = (value: OrderStatusResponse | null): value is OrderStatusSuccessResponse =>
  Boolean(value && value.ok);

const getResendErrorMessage = (
  body: { code?: string; message?: string },
  copy: CheckoutResultCopy,
): string => {
  switch (body.code) {
    case "RATE_LIMITED":
      return copy.resendErrorRateLimited;
    case "ORDER_UNPAID":
      return copy.resendErrorOrderUnpaid;
    case "DELIVERY_FAILED":
      return copy.resendErrorDeliveryFailed;
    case "RESEND_COOLDOWN":
      return copy.resendErrorCooldown;
    default:
      return copy.resendErrorGeneric;
  }
};

const applyOrderIdTemplate = (template: string, orderId: string): string =>
  template.replaceAll("{orderId}", orderId);

export default function CheckoutResultClient({
  locale,
  orderId,
  copy,
}: CheckoutResultClientProps) {
  const { clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(Boolean(orderId));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [data, setData] = useState<OrderStatusResponse | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportResetKey, setSupportResetKey] = useState(0);
  const [autoRefreshAttempts, setAutoRefreshAttempts] = useState(0);
  const hasClearedCartRef = useRef(false);

  const fetchStatus = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!orderId) {
        return;
      }

      const silent = Boolean(options?.silent);
      if (silent) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setLoadError(null);
      try {
        const response = await fetch(`/api/orders/status?orderId=${encodeURIComponent(orderId)}`, {
          method: "GET",
          cache: "no-store",
        });

        const body = (await response.json()) as OrderStatusResponse;
        if (!response.ok || !body.ok) {
          setData(body);
          setLoadError(copy.loadFailed);
          return;
        }

        setData(body);
      } catch {
        setLoadError(copy.loadFailed);
      } finally {
        if (silent) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [orderId, copy.loadFailed],
  );

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  const uiState = useMemo(() => {
    if (!isSuccessResponse(data)) {
      return "pending" as UiState;
    }
    return mapOrderStatusToUiState(data.status);
  }, [data]);

  const productLink = isSuccessResponse(data)
    ? `/${locale}/products/${data.productSlug}`
    : `/${locale}/shop`;

  const supportOrderId = orderId ?? "unknown";
  const supportSubject = applyOrderIdTemplate(copy.supportSubjectTemplate, supportOrderId);
  const supportBody = applyOrderIdTemplate(copy.supportBodyTemplate, supportOrderId);

  const canResendAccess = uiState === "paid" && isSuccessResponse(data);

  useEffect(() => {
    if (uiState !== "pending") {
      return;
    }
    if (!orderId || isLoading || isRefreshing || autoRefreshAttempts >= AUTO_REFRESH_MAX_ATTEMPTS) {
      return;
    }

    const timerId = window.setTimeout(() => {
      setAutoRefreshAttempts((current) => current + 1);
      void fetchStatus({ silent: true });
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearTimeout(timerId);
  }, [autoRefreshAttempts, fetchStatus, isLoading, isRefreshing, orderId, uiState]);

  useEffect(() => {
    if (uiState !== "paid" || hasClearedCartRef.current) {
      return;
    }

    hasClearedCartRef.current = true;
    clearCart();
    try {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.sessionStorage.removeItem(CART_STORAGE_KEY);
    } catch {
      // ignore cart persistence cleanup failures
    }
  }, [clearCart, uiState]);

  const handleResendAccess = useCallback(async () => {
    if (!orderId || !canResendAccess) {
      return;
    }

    setIsResending(true);
    setResendError(null);
    setResendMessage(null);

    try {
      const response = await fetch("/api/orders/resend-access", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const body = (await response.json()) as ResendAccessResponse;
      if (!response.ok || !body.ok) {
        const errorBody = body as { code?: string; message?: string };
        setResendError(getResendErrorMessage(errorBody, copy));
        return;
      }

      setResendMessage(copy.resendSuccess);
    } catch {
      setResendError(copy.resendErrorUnavailable);
    } finally {
      setIsResending(false);
    }
  }, [canResendAccess, copy, orderId]);

  const handleSupportOpen = useCallback(() => {
    setSupportResetKey((value) => value + 1);
    setIsSupportOpen(true);
  }, []);

  if (!orderId) {
    return <p className="text-sm text-[#9f4d4d]">{copy.invalidOrder}</p>;
  }

  if (isLoading && !data) {
    return <p className="text-sm text-deep/70">{copy.loading}</p>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl leading-tight text-deep/90 md:text-[34px]">
          {uiState === "paid"
            ? copy.paidTitle
            : uiState === "failed"
              ? copy.failedTitle
              : copy.pendingTitle}
        </h1>
        <p className="text-sm leading-relaxed text-deep/72">
          {uiState === "paid"
            ? copy.paidMessage
            : uiState === "failed"
              ? copy.failedMessage
              : copy.pendingMessage}
        </p>
        {uiState === "paid" || uiState === "pending" ? (
          <p className="text-sm leading-relaxed text-deep/64">
            {uiState === "paid" ? copy.paidSecondary : copy.pendingSecondary}
          </p>
        ) : null}
        <p className="text-xs text-deep/55">{copy.orderIdLabel}: {orderId}</p>
      </div>

      {loadError ? <p className="text-sm text-[#9f4d4d]">{loadError}</p> : null}
      {resendError ? <p className="text-sm text-[#9f4d4d]">{resendError}</p> : null}
      {resendMessage ? <p className="text-sm text-[#3d6b56]">{resendMessage}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        {uiState === "paid" && canResendAccess ? (
          <button
            type="button"
            disabled={isResending}
            onClick={() => void handleResendAccess()}
            className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep transition-colors hover:bg-[#dfc2c0]/88 disabled:opacity-70"
          >
            {isResending ? copy.resendingEmail : copy.resendEmail}
          </button>
        ) : null}

        {uiState === "pending" ? (
          <button
            type="button"
            onClick={() => void fetchStatus({ silent: true })}
            className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/45 px-5 text-sm text-deep/82 transition-colors hover:bg-white/60"
          >
            {isRefreshing ? copy.refreshingStatus : copy.refreshStatus}
          </button>
        ) : null}

        {uiState === "failed" ? (
          <Link
            href={isSuccessResponse(data) ? productLink : `/${locale}/shop`}
            className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep transition-colors hover:bg-[#dfc2c0]/88"
          >
            {isSuccessResponse(data) ? copy.returnToProduct : copy.returnToShop}
          </Link>
        ) : null}

        <button
          type="button"
          onClick={handleSupportOpen}
          className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/45 px-5 text-sm text-deep/82 transition-colors hover:bg-white/60"
        >
          {copy.contactSupport}
        </button>
      </div>

      {uiState === "pending" && (isRefreshing || autoRefreshAttempts < AUTO_REFRESH_MAX_ATTEMPTS) ? (
        <p className="text-xs text-deep/55">{copy.refreshingStatus}</p>
      ) : null}

      <Modal open={isSupportOpen} title={copy.supportModalTitle} onClose={() => setIsSupportOpen(false)}>
        <SupportForm
          resetKey={`${supportResetKey}`}
          productSlug={isSuccessResponse(data) ? data.productSlug : "order-support"}
          contextType="order_support"
          orderId={orderId ?? undefined}
          subjectOverride={supportSubject}
          initialEmail={isSuccessResponse(data) ? data.supportPrefillEmail : ""}
          initialMessage={supportBody}
          variant="modal"
          showSuccessAction
          successActionLabel={copy.supportClose}
          onSuccessAction={() => setIsSupportOpen(false)}
        />
      </Modal>
    </div>
  );
}
