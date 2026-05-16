import { getDb } from "@/lib/server/db";
import { consumeRateLimit, getRequestIp } from "@/lib/server/rate-limit";
import { fulfillPaidProductDelivery } from "@/lib/server/fulfillment/paidProductDelivery";
import { findLatestEmailDeliveryByOrderId } from "@/lib/server/repositories/emailDeliveries";
import {
  findOrderByIdWithCustomerAndProduct,
  findPaidOrdersByEmail,
} from "@/lib/server/repositories/orders";
import { isUuid } from "@/lib/server/security";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 320;
const RESEND_WINDOW_MS = 15 * 60 * 1000;
const RESEND_MAX_REQUESTS_PER_KEY = 8;
const RESEND_EMAIL_COOLDOWN_MS = 90 * 1000;
const DELIVERY_TEMPLATE_TYPE = "paid_product_delivery";

type ResendAccessPayload = {
  email?: unknown;
  orderId?: unknown;
};

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export async function POST(request: Request) {
  let payload: ResendAccessPayload;

  try {
    payload = (await request.json()) as ResendAccessPayload;
  } catch {
    return jsonResponse({ ok: false, code: "INVALID_JSON", message: "Invalid JSON" }, 400);
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const orderId = typeof payload.orderId === "string" ? payload.orderId.trim() : "";

  if (!email && !orderId) {
    return jsonResponse(
      {
        ok: false,
        code: "MISSING_INPUT",
        message: "Provide email or orderId",
      },
      400,
    );
  }

  if (email && (!EMAIL_RE.test(email) || email.length > MAX_EMAIL_LENGTH)) {
    return jsonResponse({ ok: false, code: "INVALID_EMAIL", message: "Invalid email" }, 400);
  }
  if (orderId && !isUuid(orderId)) {
    return jsonResponse({ ok: false, code: "INVALID_ORDER_ID", message: "Invalid orderId" }, 400);
  }

  const ip = getRequestIp(request);
  const limiterKey = `resend_access:${ip}:${email || orderId}`;
  const rateLimit = consumeRateLimit({
    key: limiterKey,
    windowMs: RESEND_WINDOW_MS,
    maxRequests: RESEND_MAX_REQUESTS_PER_KEY,
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
    let order =
      orderId.length > 0 ? await findOrderByIdWithCustomerAndProduct(db, orderId) : null;

    if (!order && email) {
      const paidOrders = await findPaidOrdersByEmail(db, email, 1);
      if (paidOrders[0]) {
        order = await findOrderByIdWithCustomerAndProduct(db, paidOrders[0].orderId);
      }
    }

    if (!order) {
      return jsonResponse(
        { ok: false, code: "ORDER_NOT_FOUND", message: "No paid order found" },
        404,
      );
    }

    console.info("Resend-access order resolved", {
      orderId: order.id,
      status: order.status,
      fulfillmentStatus: order.fulfillmentStatus,
      hasCustomerEmail: Boolean(order.customerEmail),
    });

    if (email && order.customerEmail.toLowerCase() !== email) {
      return jsonResponse(
        { ok: false, code: "ORDER_NOT_FOUND", message: "No paid order found" },
        404,
      );
    }

    if (order.status !== "paid") {
      return jsonResponse(
        { ok: false, code: "ORDER_UNPAID", message: "Payment is not confirmed yet." },
        409,
      );
    }

    const latestDelivery = await findLatestEmailDeliveryByOrderId(
      db,
      order.id,
      DELIVERY_TEMPLATE_TYPE,
    );
    const isDeliveryFailure =
      order.fulfillmentStatus === "delivery_failed" || latestDelivery?.status === "failed";
    if (latestDelivery && latestDelivery.status === "sent" && !isDeliveryFailure) {
      const createdAtMs = Date.parse(latestDelivery.createdAt);
      const deliveryAgeMs = Number.isFinite(createdAtMs)
        ? Date.now() - createdAtMs
        : Number.POSITIVE_INFINITY;
      if (deliveryAgeMs >= 0 && deliveryAgeMs < RESEND_EMAIL_COOLDOWN_MS) {
        console.info("Resend-access blocked by cooldown", {
          orderId: order.id,
          latestDeliveryStatus: latestDelivery.status,
          latestDeliveryCreatedAt: latestDelivery.createdAt,
        });
        return jsonResponse(
          {
            ok: false,
            code: "RESEND_COOLDOWN",
            message: "Please wait before requesting another access email.",
          },
          429,
        );
      }
    }

    const fulfillmentResult = await fulfillPaidProductDelivery(db, {
      orderId: order.id,
      allowResendEmail: true,
      forceNewToken: false,
    });

    if (fulfillmentResult.status === "delivery_failed") {
      console.error("Resend-access delivery failed", {
        orderId: order.id,
        fulfillmentStatus: order.fulfillmentStatus,
      });
      return jsonResponse(
        {
          ok: false,
          code: "DELIVERY_FAILED",
          message: "We couldn’t resend the email. Please contact support and include your order ID.",
        },
        502,
      );
    }

    console.info("Resend-access delivered", {
      orderId: order.id,
      resultStatus: fulfillmentResult.status,
    });

    return jsonResponse({
      ok: true,
      orderId: order.id,
      status: fulfillmentResult.status,
      message: "We sent the email again. Please check your inbox and spam folder.",
    });
  } catch (error) {
    console.error("Resend-access failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse(
      { ok: false, code: "RESEND_FAILED", message: "Unable to resend access right now" },
      500,
    );
  }
}
