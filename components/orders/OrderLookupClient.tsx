"use client";

import { useState } from "react";

type LookupOrderItem = {
  orderId: string;
  orderRef: string;
  productName: string;
  paidAt: string;
  fulfillmentStatus: string;
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
};

export default function OrderLookupClient({
  supportEmail,
  initialOrderId = "",
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
        const message = "message" in body ? body.message : undefined;
        setLookupError(message ?? "Unable to find orders.");
        return;
      }

      setOrders(body.orders);
      if (body.orders.length === 0) {
        setLookupError("No paid orders found for this email yet.");
      }
    } catch {
      setLookupError("Unable to find orders right now.");
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
        const message = "message" in body ? body.message : undefined;
        setLookupError(message ?? "Unable to resend access.");
        return;
      }

      setResendMessage("Access email has been re-sent. Please check inbox/spam.");
    } catch {
      setLookupError("Unable to resend access right now.");
    } finally {
      setResendingOrderId(null);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
      <div className="space-y-2">
        <h1 className="text-3xl text-deep/90">Find your order</h1>
        <p className="text-sm text-deep/70">
          Enter the same email used at checkout to find paid orders and resend secure access.
        </p>
        {initialOrderId ? (
          <p className="text-xs text-deep/60">Order ID from checkout: {initialOrderId}</p>
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
          Email
        </label>
        <div className="flex flex-wrap gap-3">
          <input
            id="order-lookup-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="h-11 flex-1 min-w-[240px] rounded-full border border-[#dfc2c0]/40 bg-white px-4 text-sm text-deep/80 outline-none"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep disabled:opacity-70"
          >
            {isLoading ? "Searching..." : "Find orders"}
          </button>
        </div>
      </form>

      {lookupError ? <p className="text-sm text-[#9f4d4d]">{lookupError}</p> : null}
      {resendMessage ? <p className="text-sm text-[#3d6b56]">{resendMessage}</p> : null}

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="rounded-2xl border border-[#dfc2c0]/30 bg-white/80 p-4 text-sm text-deep/75"
            >
              <p className="text-deep/90">{order.productName}</p>
              <p className="text-xs text-deep/60">Order: {order.orderRef}</p>
              <p className="text-xs text-deep/60">Paid at: {new Date(order.paidAt).toLocaleString()}</p>
              <p className="text-xs text-deep/60">Fulfillment: {order.fulfillmentStatus}</p>
              <button
                type="button"
                onClick={() => void resendAccess(order.orderId)}
                disabled={resendingOrderId === order.orderId}
                className="mt-3 inline-flex h-10 items-center rounded-full border border-[#dfc2c0]/50 bg-[#dfc2c0]/70 px-4 text-xs text-deep disabled:opacity-70"
              >
                {resendingOrderId === order.orderId ? "Resending..." : "Resend access"}
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <p className="text-sm text-deep/70">
        Need help?{" "}
        <a href={`mailto:${supportEmail}`} className="underline">
          {supportEmail}
        </a>
      </p>
    </div>
  );
}
