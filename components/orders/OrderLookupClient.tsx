"use client";

import { useState } from "react";

type LookupOrderItem = {
  orderId: string;
  orderRef: string;
  productName: string;
  productSlug: string;
  paymentStatus: "initiated" | "processing" | "paid" | "failed" | "expired" | "manual_review";
  paidAt: string | null;
  fulfillmentStatus: "pending" | "ready_for_delivery" | "delivered" | "delivery_failed" | null;
};

type LookupResponse =
  | {
      ok: true;
      orders: LookupOrderItem[];
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

type ResendResponse =
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

type OrderLookupClientProps = {
  supportEmail: string;
  initialOrderId?: string;
  checkoutBasePath?: string;
  copy?: OrderLookupCopy;
};

const isPaymentCompleted = (paymentStatus: LookupOrderItem["paymentStatus"]): boolean =>
  paymentStatus === "paid";

type OrderLookupCopy = {
  title: string;
  description: string;
  initialOrderIdLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  findOrders: string;
  searching: string;
  lookupEmpty: string;
  lookupErrorGeneric: string;
  lookupErrorUnavailable: string;
  lookupErrorInvalidEmail: string;
  lookupErrorRateLimited: string;
  resendSuccess: string;
  resendErrorGeneric: string;
  resendErrorUnavailable: string;
  resendErrorInvalidEmail: string;
  resendErrorRateLimited: string;
  resendErrorOrderNotFound: string;
  resendErrorOrderUnpaid: string;
  resendErrorDeliveryFailed: string;
  resendErrorCooldown: string;
  orderLabel: string;
  paidAtLabel: string;
  paymentConfirmed: string;
  paymentNotCompleted: string;
  paymentNotConfirmed: string;
  paymentVerifying: string;
  deliveryFailed: string;
  deliveryDelivered: string;
  deliveryOnTheWay: string;
  resending: string;
  resendAccess: string;
  completePayment: string;
  needHelp: string;
};

const DEFAULT_COPY: OrderLookupCopy = {
  title: "Find your order",
  description:
    "Enter the same email used at checkout to find paid orders and resend secure access.",
  initialOrderIdLabel: "Order ID from checkout",
  emailLabel: "Email",
  emailPlaceholder: "you@example.com",
  findOrders: "Find orders",
  searching: "Searching...",
  lookupEmpty: "No paid orders found for this email yet.",
  lookupErrorGeneric: "Unable to find orders.",
  lookupErrorUnavailable: "Unable to find orders right now.",
  lookupErrorInvalidEmail: "Please enter a valid email.",
  lookupErrorRateLimited: "Too many requests. Please try again later.",
  resendSuccess: "Access email has been re-sent. Please check your inbox or spam folder.",
  resendErrorGeneric: "Unable to resend access.",
  resendErrorUnavailable: "Unable to resend access right now.",
  resendErrorInvalidEmail: "Please enter a valid email.",
  resendErrorRateLimited: "Too many requests. Please try again later.",
  resendErrorOrderNotFound: "No paid order found for this email yet.",
  resendErrorOrderUnpaid: "Payment was not confirmed for this order yet.",
  resendErrorDeliveryFailed: "Unable to send access email right now. Please try again later.",
  resendErrorCooldown: "Please wait before requesting another access email.",
  orderLabel: "Order",
  paidAtLabel: "Paid at",
  paymentConfirmed: "Payment confirmed",
  paymentNotCompleted: "Payment not completed",
  paymentNotConfirmed: "Payment was not confirmed.",
  paymentVerifying: "We are still waiting for payment confirmation.",
  deliveryFailed: "We couldn't send your access email.",
  deliveryDelivered: "Access email sent. Check your inbox or spam folder.",
  deliveryOnTheWay: "Your access email is on the way.",
  resending: "Resending...",
  resendAccess: "Resend access",
  completePayment: "Complete payment",
  needHelp: "Need help?",
};

const getLookupErrorMessage = (
  body: { code?: string; message?: string },
  copy: OrderLookupCopy,
): string => {
  switch (body.code) {
    case "INVALID_EMAIL":
      return copy.lookupErrorInvalidEmail;
    case "RATE_LIMITED":
      return copy.lookupErrorRateLimited;
    default:
      return copy.lookupErrorGeneric;
  }
};

const getResendErrorMessage = (
  body: { code?: string; message?: string },
  copy: OrderLookupCopy,
): string => {
  switch (body.code) {
    case "INVALID_EMAIL":
      return copy.resendErrorInvalidEmail;
    case "RATE_LIMITED":
      return copy.resendErrorRateLimited;
    case "ORDER_NOT_FOUND":
      return copy.resendErrorOrderNotFound;
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

export default function OrderLookupClient({
  supportEmail,
  initialOrderId = "",
  checkoutBasePath = "/checkout",
  copy = DEFAULT_COPY,
}: OrderLookupClientProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<LookupOrderItem[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendingOrderId, setResendingOrderId] = useState<string | null>(null);

  const lookupOrders = async () => {
    setLookupError(null);
    setResendMessage(null);
    setIsLoading(true);
    setOrders([]);

    try {
      const response = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const body = (await response.json()) as LookupResponse;
      if (!response.ok || !body.ok) {
        const errorBody = body as { code?: string; message?: string };
        setLookupError(getLookupErrorMessage(errorBody, copy));
        return;
      }

      setOrders(body.orders);
      if (body.orders.length === 0) {
        setLookupError(copy.lookupEmpty);
      }
    } catch {
      setLookupError(copy.lookupErrorUnavailable);
    } finally {
      setIsLoading(false);
    }
  };

  const resendAccess = async (orderId: string) => {
    setLookupError(null);
    setResendMessage(null);
    setResendingOrderId(orderId);

    try {
      const response = await fetch("/api/orders/resend-access", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email, orderId }),
      });

      const body = (await response.json()) as ResendResponse;
      if (!response.ok || !body.ok) {
        const errorBody = body as { code?: string; message?: string };
        setLookupError(getResendErrorMessage(errorBody, copy));
        return;
      }

      setResendMessage(copy.resendSuccess);
    } catch {
      setLookupError(copy.resendErrorUnavailable);
    } finally {
      setResendingOrderId(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl text-deep/90">{copy.title}</h1>
        <p className="text-sm text-deep/70">{copy.description}</p>
        {initialOrderId ? (
          <p className="text-xs text-deep/60">
            {copy.initialOrderIdLabel}: {initialOrderId}
          </p>
        ) : null}
      </div>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void lookupOrders();
        }}
      >
        <label htmlFor="order-lookup-email" className="text-xs uppercase tracking-[0.12em] text-deep/60">
          {copy.emailLabel}
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="order-lookup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={copy.emailPlaceholder}
            className="h-11 flex-1 min-w-[240px] rounded-full border border-[#dfc2c0]/40 bg-white px-4 text-sm text-deep/80 outline-none"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep disabled:opacity-70"
          >
            {isLoading ? copy.searching : copy.findOrders}
          </button>
        </div>
      </form>

      {lookupError ? <p className="text-sm text-[#9f4d4d]">{lookupError}</p> : null}
      {resendMessage ? <p className="text-sm text-[#3d6b56]">{resendMessage}</p> : null}

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const isPaid = isPaymentCompleted(order.paymentStatus);
            const paymentNotCompleted =
              order.paymentStatus === "failed" || order.paymentStatus === "expired";
            const checkoutHref = `${checkoutBasePath}?product=${encodeURIComponent(order.productSlug)}`;

            return (
              <div
                key={order.orderId}
                className="rounded-2xl border border-[#dfc2c0]/30 bg-white/80 p-4 text-sm text-deep/75"
              >
                <p className="text-deep/90">{order.productName}</p>
                <p className="text-xs text-deep/60">
                  {copy.orderLabel}: {order.orderRef}
                </p>
                <p className="mt-2 text-sm text-deep/90">
                  {isPaid ? copy.paymentConfirmed : copy.paymentNotCompleted}
                </p>
                {!isPaid ? (
                  <p className="text-xs text-deep/65">
                    {paymentNotCompleted ? copy.paymentNotConfirmed : copy.paymentVerifying}
                  </p>
                ) : order.fulfillmentStatus === "delivery_failed" ? (
                  <p className="text-xs text-[#9f4d4d]">{copy.deliveryFailed}</p>
                ) : order.fulfillmentStatus === "delivered" ? (
                  <p className="text-xs text-deep/65">{copy.deliveryDelivered}</p>
                ) : (
                  <p className="text-xs text-deep/65">{copy.deliveryOnTheWay}</p>
                )}
                {isPaid && order.paidAt ? (
                  <p className="text-xs text-deep/60">
                    {copy.paidAtLabel}: {new Date(order.paidAt).toLocaleString()}
                  </p>
                ) : null}
                {isPaid ? (
                  <button
                    type="button"
                    onClick={() => void resendAccess(order.orderId)}
                    disabled={resendingOrderId === order.orderId}
                    className="mt-3 inline-flex h-10 items-center rounded-full border border-[#dfc2c0]/50 bg-[#dfc2c0]/70 px-4 text-xs text-deep disabled:opacity-70"
                  >
                    {resendingOrderId === order.orderId ? copy.resending : copy.resendAccess}
                  </button>
                ) : (
                  <a
                    href={checkoutHref}
                    className="mt-3 inline-flex h-10 items-center rounded-full border border-[#dfc2c0]/50 bg-[#dfc2c0]/70 px-4 text-xs text-deep"
                  >
                    {copy.completePayment}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      ) : null}

      <p className="text-sm text-deep/70">
        {copy.needHelp}{" "}
        <a href={`mailto:${supportEmail}`} className="underline">
          {supportEmail}
        </a>
      </p>
    </div>
  );
}
