import { getDb } from "@/lib/server/db";
import { MissingPaymentEnvError, getRequiredMonoEnv } from "@/lib/server/env";
import { fulfillPaidProductDelivery } from "@/lib/server/fulfillment/paidProductDelivery";
import {
  extractMonoAmountMinor,
  extractMonoCurrencyCode,
  extractMonoInvoiceId,
  extractMonoModifiedDateMs,
  extractMonoOrderReference,
  getMonoEventType,
  mapMonoWebhookOutcome,
  normalizeMonoWebhookPayload,
  sha256HexWeb,
  verifyMonoWebhookSignature,
} from "@/lib/server/payments/mono-webhook";
import {
  createPaymentEvent,
  markPaymentEventProcessed,
} from "@/lib/server/repositories/paymentEvents";
import {
  findLatestPaymentAttemptByOrderId,
  findLatestPaymentAttemptByProviderOrderId,
  updatePaymentAttemptStatus,
} from "@/lib/server/repositories/paymentAttempts";
import {
  findOrderByIdWithCustomerAndProduct,
  markOrderAsExpired,
  markOrderAsFailed,
  markOrderAsManualReview,
  markOrderAsPaid,
  markOrderAsProcessing,
} from "@/lib/server/repositories/orders";
import { isUuid } from "@/lib/server/security";

const MONO_CCY_UAH = 980;
const DUPLICATE_IN_FLIGHT_WINDOW_MS = 2 * 60 * 1000;
const MAX_WEBHOOK_CONTENT_LENGTH = 100_000;

const textResponse = (body: string, status = 200) =>
  new Response(body, {
    status,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const extractStoredModifiedDateMs = (payloadJson: string | null): number | null => {
  if (!payloadJson) {
    return null;
  }

  try {
    const parsed = JSON.parse(payloadJson) as {
      modifiedDateMs?: unknown;
      webhook?: { modifiedDate?: unknown };
    };

    if (typeof parsed.modifiedDateMs === "number" && Number.isFinite(parsed.modifiedDateMs)) {
      return Math.trunc(parsed.modifiedDateMs);
    }

    if (parsed.webhook && typeof parsed.webhook === "object") {
      const raw = parsed.webhook.modifiedDate;
      if (typeof raw === "string" && raw.trim()) {
        const asDate = Date.parse(raw);
        return Number.isFinite(asDate) ? asDate : null;
      }
      if (typeof raw === "number" && Number.isFinite(raw)) {
        return Math.trunc(raw > 1_000_000_000_000 ? raw : raw * 1000);
      }
    }
  } catch {
    return null;
  }

  return null;
};

const getDuplicateInFlight = (createdAt: string): boolean => {
  const createdAtMillis = Date.parse(createdAt);
  if (!Number.isFinite(createdAtMillis)) {
    return false;
  }

  const age = Date.now() - createdAtMillis;
  return age >= 0 && age < DUPLICATE_IN_FLIGHT_WINDOW_MS;
};

export async function GET() {
  return jsonResponse({
    ok: true,
    message: "Monobank webhook endpoint is alive",
  });
}

export async function POST(request: Request) {
  const contentLengthHeader = request.headers.get("content-length");
  if (contentLengthHeader) {
    const contentLength = Number.parseInt(contentLengthHeader, 10);
    if (Number.isFinite(contentLength) && contentLength > MAX_WEBHOOK_CONTENT_LENGTH) {
      return textResponse("Payload Too Large", 413);
    }
  }

  const rawBody = await request.text();
  if (!rawBody.trim()) {
    return textResponse("Bad Request", 400);
  }

  const xSign = request.headers.get("x-sign")?.trim() ?? "";
  if (!xSign) {
    console.error("Mono webhook signature invalid", { reason: "missing_x_sign" });
    return textResponse("Unauthorized", 401);
  }

  let env: Awaited<ReturnType<typeof getRequiredMonoEnv>>;
  try {
    env = await getRequiredMonoEnv();
  } catch (error) {
    if (error instanceof MissingPaymentEnvError) {
      console.error("Mono webhook env missing", { missingKeys: error.missingKeys });
      return textResponse("Server Error", 500);
    }

    console.error("Mono webhook env error", {
      message: error instanceof Error ? error.message : "Unknown env error",
    });
    return textResponse("Server Error", 500);
  }

  console.info("Mono webhook received", {
    hasSignature: Boolean(xSign),
  });

  let signatureValid = false;
  try {
    signatureValid = await verifyMonoWebhookSignature(
      rawBody,
      xSign,
      env.monoApiBaseUrl,
      env.monoToken,
    );
  } catch (error) {
    console.error("Mono webhook signature verification failed", {
      message: error instanceof Error ? error.message : "Unknown verification error",
    });
    return textResponse("Unauthorized", 401);
  }

  if (!signatureValid) {
    console.error("Mono webhook signature invalid", {
      reason: "signature_mismatch",
    });
    return textResponse("Unauthorized", 401);
  }

  console.info("Mono webhook signature valid");

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody) as unknown;
  } catch {
    return textResponse("Bad Request", 400);
  }

  const payload = normalizeMonoWebhookPayload(parsed);
  if (!payload) {
    return textResponse("Bad Request", 400);
  }

  const eventType = getMonoEventType(payload);
  const providerInvoiceId = extractMonoInvoiceId(payload);
  const reference = extractMonoOrderReference(payload);
  const orderId = reference && isUuid(reference) ? reference : null;
  const modifiedDateMs = extractMonoModifiedDateMs(payload);
  console.info("Mono webhook received event", {
    eventType,
    providerInvoiceId,
    reference,
    orderId,
  });
  const idempotencyKey = await sha256HexWeb(
    `${providerInvoiceId ?? ""}|${eventType}|${String(payload.modifiedDate ?? "")}|${xSign}|${rawBody}`,
  );

  const db = await getDb();
  const { event, inserted } = await createPaymentEvent(db, {
    id: crypto.randomUUID(),
    orderId,
    provider: "mono",
    eventType,
    idempotencyKey,
    payloadJson: JSON.stringify({ webhook: payload }),
  });

  if (!inserted && event.processedAt) {
    console.info("Mono webhook duplicate ignored", {
      paymentEventId: event.id,
      eventType,
      providerInvoiceId,
      orderId,
    });
    return textResponse("OK");
  }

  if (!inserted && !event.processedAt && getDuplicateInFlight(event.createdAt)) {
    console.info("Mono webhook duplicate in-flight acknowledged", {
      paymentEventId: event.id,
      eventType,
      providerInvoiceId,
      orderId,
    });
    return textResponse("OK");
  }

  let paymentAttempt =
    providerInvoiceId
      ? await findLatestPaymentAttemptByProviderOrderId(db, providerInvoiceId)
      : null;

  let order = orderId ? await findOrderByIdWithCustomerAndProduct(db, orderId) : null;
  if (!order && paymentAttempt) {
    order = await findOrderByIdWithCustomerAndProduct(db, paymentAttempt.orderId);
  }

  if (!paymentAttempt && order) {
    paymentAttempt = await findLatestPaymentAttemptByOrderId(db, order.id);
  }

  if (!order) {
    console.error("Mono webhook order not found", {
      paymentEventId: event.id,
      eventType,
      providerInvoiceId,
      orderId,
    });
    await markPaymentEventProcessed(db, event.id);
    return textResponse("OK");
  }

  console.info("Mono webhook order resolved", {
    paymentEventId: event.id,
    orderId: order.id,
    status: order.status,
    fulfillmentStatus: order.fulfillmentStatus,
    hasCustomerEmail: Boolean(order.customerEmail),
    hasProductName: Boolean(order.productName),
    hasProductTargetUrl: Boolean(order.productTargetUrl),
  });

  if (modifiedDateMs !== null && paymentAttempt) {
    const storedModifiedDateMs = extractStoredModifiedDateMs(paymentAttempt.payloadJson);
    if (storedModifiedDateMs !== null && modifiedDateMs < storedModifiedDateMs) {
      console.info("Mono webhook stale event ignored", {
        paymentEventId: event.id,
        orderId: order.id,
        providerInvoiceId,
        eventType,
        incomingModifiedDateMs: modifiedDateMs,
        storedModifiedDateMs,
      });
      await markPaymentEventProcessed(db, event.id);
      return textResponse("OK");
    }
  }

  const callbackAmount = extractMonoAmountMinor(payload);
  const callbackCcy = extractMonoCurrencyCode(payload);
  const mismatchReasons: string[] = [];

  if (callbackAmount === null || callbackAmount !== order.amountMinor) {
    mismatchReasons.push("amount_mismatch");
  }

  if (callbackCcy === null || callbackCcy !== MONO_CCY_UAH) {
    mismatchReasons.push("currency_mismatch");
  }

  const outcome = mapMonoWebhookOutcome(payload.status);
  const attemptPayloadJson = JSON.stringify({
    webhook: payload,
    modifiedDateMs,
  });

  if (mismatchReasons.length > 0) {
    await markOrderAsManualReview(db, order.id);
    if (paymentAttempt) {
      await updatePaymentAttemptStatus(db, {
        id: paymentAttempt.id,
        status: "failed",
        providerOrderId: providerInvoiceId ?? paymentAttempt.providerOrderId,
        providerPaymentId: providerInvoiceId ?? paymentAttempt.providerPaymentId,
        rawStatus: `manual_review:${eventType}`,
        payloadJson: attemptPayloadJson,
      });
    }

    console.error("Mono webhook manual review required", {
      paymentEventId: event.id,
      orderId: order.id,
      providerInvoiceId,
      eventType,
      mismatchReasons,
      callbackAmount,
      callbackCcy,
    });
    await markPaymentEventProcessed(db, event.id);
    return textResponse("OK");
  }

  if (outcome === "paid") {
    const alreadyPaid = order.status === "paid";
    const shouldAttemptDeliveryRecovery = alreadyPaid && order.fulfillmentStatus !== "delivered";
    if (!alreadyPaid) {
      await markOrderAsPaid(db, order.id);
    }

    if (paymentAttempt) {
      await updatePaymentAttemptStatus(db, {
        id: paymentAttempt.id,
        status: "paid",
        providerOrderId: providerInvoiceId ?? paymentAttempt.providerOrderId,
        providerPaymentId: providerInvoiceId ?? paymentAttempt.providerPaymentId,
        rawStatus: eventType,
        payloadJson: attemptPayloadJson,
      });
    }

    if (alreadyPaid && !shouldAttemptDeliveryRecovery) {
      console.info("Mono webhook delivery skipped for already paid order", {
        paymentEventId: event.id,
        orderId: order.id,
        providerInvoiceId,
      });
    } else {
      try {
        const fulfillmentResult = await fulfillPaidProductDelivery(db, {
          orderId: order.id,
          allowResendEmail: false,
          forceNewToken: false,
        });

        console.info("Mono webhook delivery processed", {
          paymentEventId: event.id,
          orderId: order.id,
          providerInvoiceId,
          mode: alreadyPaid ? "recovery" : "initial",
          deliveryStatus: fulfillmentResult.status,
        });
      } catch (error) {
        console.error("Mono webhook delivery execution failed", {
          paymentEventId: event.id,
          orderId: order.id,
          providerInvoiceId,
          mode: alreadyPaid ? "recovery" : "initial",
          message: error instanceof Error ? error.message : "Unknown delivery execution error",
        });
      }
    }

    console.info("Mono webhook order status transition", {
      paymentEventId: event.id,
      orderId: order.id,
      providerInvoiceId,
      from: order.status,
      to: "paid",
      eventType,
    });

    await markPaymentEventProcessed(db, event.id);
    return textResponse("OK");
  }

  if (outcome === "failed") {
    if (order.status === "paid") {
      console.info("Mono webhook ignored failed transition for paid order", {
        paymentEventId: event.id,
        orderId: order.id,
        providerInvoiceId,
        eventType,
      });
      await markPaymentEventProcessed(db, event.id);
      return textResponse("OK");
    }

    await markOrderAsFailed(db, order.id);

    if (paymentAttempt) {
      await updatePaymentAttemptStatus(db, {
        id: paymentAttempt.id,
        status: "failed",
        providerOrderId: providerInvoiceId ?? paymentAttempt.providerOrderId,
        providerPaymentId: providerInvoiceId ?? paymentAttempt.providerPaymentId,
        rawStatus: eventType,
        payloadJson: attemptPayloadJson,
      });
    }

    console.info("Mono webhook order status transition", {
      paymentEventId: event.id,
      orderId: order.id,
      providerInvoiceId,
      from: order.status,
      to: "failed",
      eventType,
    });

    await markPaymentEventProcessed(db, event.id);
    return textResponse("OK");
  }

  if (outcome === "expired") {
    if (order.status === "paid") {
      console.info("Mono webhook ignored expired transition for paid order", {
        paymentEventId: event.id,
        orderId: order.id,
        providerInvoiceId,
        eventType,
      });
      await markPaymentEventProcessed(db, event.id);
      return textResponse("OK");
    }

    await markOrderAsExpired(db, order.id);

    if (paymentAttempt) {
      await updatePaymentAttemptStatus(db, {
        id: paymentAttempt.id,
        status: "expired",
        providerOrderId: providerInvoiceId ?? paymentAttempt.providerOrderId,
        providerPaymentId: providerInvoiceId ?? paymentAttempt.providerPaymentId,
        rawStatus: eventType,
        payloadJson: attemptPayloadJson,
      });
    }

    console.info("Mono webhook order status transition", {
      paymentEventId: event.id,
      orderId: order.id,
      providerInvoiceId,
      from: order.status,
      to: "expired",
      eventType,
    });

    await markPaymentEventProcessed(db, event.id);
    return textResponse("OK");
  }

  if (order.status !== "paid") {
    await markOrderAsProcessing(db, order.id);
  }
  if (paymentAttempt) {
    await updatePaymentAttemptStatus(db, {
      id: paymentAttempt.id,
      status: order.status === "paid" ? "paid" : "pending",
      providerOrderId: providerInvoiceId ?? paymentAttempt.providerOrderId,
      providerPaymentId: providerInvoiceId ?? paymentAttempt.providerPaymentId,
      rawStatus: eventType,
      payloadJson: attemptPayloadJson,
    });
  }

  if (order.status !== "paid") {
    console.info("Mono webhook order status transition", {
      paymentEventId: event.id,
      orderId: order.id,
      providerInvoiceId,
      from: order.status,
      to: "processing",
      eventType,
    });
  } else {
    console.info("Mono webhook ignored non-final transition for paid order", {
      paymentEventId: event.id,
      orderId: order.id,
      providerInvoiceId,
      eventType,
    });
  }

  await markPaymentEventProcessed(db, event.id);
  return textResponse("OK");
}
