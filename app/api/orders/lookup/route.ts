import { getDb } from "@/lib/server/db";
import { consumeRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { findRecentOrdersByEmail } from "@/lib/server/repositories/orders";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 320;
const LOOKUP_WINDOW_MS = 10 * 60 * 1000;
const LOOKUP_MAX_REQUESTS_PER_IP = 20;

type LookupPayload = {
  email?: unknown;
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const maskOrderId = (value: string): string => {
  if (value.length <= 8) {
    return value;
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

export async function POST(request: Request) {
  let payload: LookupPayload;

  try {
    payload = (await request.json()) as LookupPayload;
  } catch {
    return jsonResponse({ ok: false, code: "INVALID_JSON", message: "Invalid JSON" }, 400);
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL_LENGTH) {
    return jsonResponse({ ok: false, code: "INVALID_EMAIL", message: "Invalid email" }, 400);
  }

  const ip = getRequestIp(request);
  const rateLimit = consumeRateLimit({
    key: `order_lookup:${ip}`,
    windowMs: LOOKUP_WINDOW_MS,
    maxRequests: LOOKUP_MAX_REQUESTS_PER_IP,
  });
  if (rateLimit.isLimited) {
    return jsonResponse(
      {
        ok: false,
        code: "RATE_LIMITED",
        message: "Too many requests. Please try again later.",
      },
      429,
    );
  }

  try {
    const db = await getDb();
    const orders = await findRecentOrdersByEmail(db, email, 10);

    return jsonResponse({
      ok: true,
      orders: orders.map((order) => ({
        orderId: order.orderId,
        orderRef: maskOrderId(order.orderId),
        productName: order.productName,
        productSlug: order.productSlug,
        paymentStatus: order.paymentStatus,
        paidAt: order.paidAt,
        fulfillmentStatus: order.paymentStatus === "paid" ? order.fulfillmentStatus : null,
      })),
    });
  } catch (error) {
    console.error("Order lookup failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse(
      { ok: false, code: "LOOKUP_FAILED", message: "Unable to find orders right now" },
      500,
    );
  }
}
