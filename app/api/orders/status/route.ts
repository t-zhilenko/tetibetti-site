import { getDb } from "@/lib/server/db";
import { findOrderByIdWithCustomerAndProduct } from "@/lib/server/repositories/orders";
import { findLatestPaymentAttemptByOrderId } from "@/lib/server/repositories/paymentAttempts";
import { isUuid } from "@/lib/server/security";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderIdRaw = url.searchParams.get("orderId") ?? "";
  const orderId = orderIdRaw.trim();

  if (!orderId) {
    return jsonResponse({ ok: false, code: "MISSING_ORDER_ID", message: "Missing orderId" }, 400);
  }

  if (!isUuid(orderId)) {
    return jsonResponse({ ok: false, code: "INVALID_ORDER_ID", message: "Invalid orderId" }, 400);
  }

  try {
    const db = await getDb();
    const order = await findOrderByIdWithCustomerAndProduct(db, orderId);
    if (!order) {
      return jsonResponse({ ok: false, code: "ORDER_NOT_FOUND", message: "Order not found" }, 404);
    }

    const paymentAttempt = await findLatestPaymentAttemptByOrderId(db, order.id);

    return jsonResponse({
      ok: true,
      orderId: order.id,
      status: order.status,
      productSlug: order.productSlug,
      email: order.customerEmail,
      paymentProvider: paymentAttempt?.provider ?? order.provider,
      providerInvoiceId: paymentAttempt?.providerOrderId ?? null,
    });
  } catch (error) {
    console.error("Order status lookup failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse(
      { ok: false, code: "ORDER_STATUS_FAILED", message: "Unable to load order status" },
      500,
    );
  }
}
