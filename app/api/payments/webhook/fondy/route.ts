import { randomUUID } from "node:crypto";
import { MissingPaymentEnvError, getRequiredFondyEnv } from "@/lib/server/env";
import { getDb } from "@/lib/server/db";
import {
  extractFondyOrderIds,
  getFondyEventType,
  mapFondyWebhookOutcome,
  normalizeFondyWebhookPayload,
  toMinorAmount,
  toUpperCurrency,
  validateFondyWebhookSignature,
  type FondyWebhookPayload,
} from "@/lib/server/payments/fondy-webhook";
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
import { isUuid, sha256Hex } from "@/lib/server/security";
import { fulfillPaidProductDelivery } from "@/lib/server/fulfillment/paidProductDelivery";

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

const DUPLICATE_IN_FLIGHT_WINDOW_MS = 2 * 60 * 1000;
const MAX_WEBHOOK_CONTENT_LENGTH = 100_000;

const parseWebhookRequestPayload = async (request: Request): Promise<unknown> => {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return request.json();
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    return Object.fromEntries(formData.entries());
  }

  const bodyText = await request.text();
  if (!bodyText.trim()) {
    return null;
  }

  try {
    return JSON.parse(bodyText) as unknown;
  } catch {
    const params = new URLSearchParams(bodyText);
    if (Array.from(params.keys()).length === 0) {
      return null;
    }

    return Object.fromEntries(params.entries());
  }
};

const getProviderPaymentId = (payload: FondyWebhookPayload): string | null => {
  if (typeof payload.payment_id === "string" && payload.payment_id.trim()) {
    return payload.payment_id.trim();
  }

  if (typeof payload.payment_id === "number" && Number.isFinite(payload.payment_id)) {
    return String(payload.payment_id);
  }

  return null;
};

const getIdempotencyKey = (
  payload: FondyWebhookPayload,
  eventType: string,
  providerOrderId: string | null,
): string => {
  const paymentId = getProviderPaymentId(payload) ?? "";
  const signature = typeof payload.signature === "string" ? payload.signature : "";
  const stablePayload = JSON.stringify(
    Object.keys(payload)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = payload[key];
        return acc;
      }, {}),
  );
  return sha256Hex(`${providerOrderId ?? ""}|${paymentId}|${eventType}|${signature}|${stablePayload}`);
};

export async function GET() {
  return jsonResponse({
    ok: true,
    message: "Fondy webhook endpoint is alive",
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

  let parsedPayload: unknown;

  try {
    parsedPayload = await parseWebhookRequestPayload(request);
  } catch (error) {
    console.error("Fondy webhook: unable to parse request payload", {
      message: error instanceof Error ? error.message : "Unknown parse error",
    });
    return textResponse("Bad Request", 400);
  }

  const payload = normalizeFondyWebhookPayload(parsedPayload);
  if (!payload) {
    return textResponse("Bad Request", 400);
  }

  let env: Awaited<ReturnType<typeof getRequiredFondyEnv>>;
  try {
    env = await getRequiredFondyEnv();
  } catch (error) {
    if (error instanceof MissingPaymentEnvError) {
      console.error("Fondy webhook: missing payment env", {
        missingKeys: error.missingKeys,
      });
      return textResponse("Server Error", 500);
    }

    console.error("Fondy webhook: unable to load payment env", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return textResponse("Server Error", 500);
  }

  const signatureCheck = validateFondyWebhookSignature(payload, env.fondySecretKey);
  const eventType = getFondyEventType(payload);
  const { orderId: extractedOrderId, providerOrderId } = extractFondyOrderIds(payload);
  const orderId = extractedOrderId && isUuid(extractedOrderId) ? extractedOrderId : null;
  const idempotencyKey = getIdempotencyKey(payload, eventType, providerOrderId);

  if (!signatureCheck.isValid) {
    console.error("Fondy webhook: invalid signature", {
      orderId,
      providerOrderId,
      eventType,
      signatureFieldCount: signatureCheck.signatureMaterial.orderedFieldNames.length,
    });
    return textResponse("Bad Signature", 400);
  }

  const db = await getDb();
  const paymentEventPayloadJson = JSON.stringify({
    webhook: payload,
  });

  const { event, inserted } = await createPaymentEvent(db, {
    id: randomUUID(),
    orderId,
    provider: "fondy",
    eventType,
    idempotencyKey,
    payloadJson: paymentEventPayloadJson,
  });

  if (!inserted && event.processedAt) {
    console.info("Fondy webhook: duplicate event ignored", {
      paymentEventId: event.id,
      idempotencyKey,
      orderId,
      providerOrderId,
      eventType,
    });
    return textResponse("OK");
  }

  if (!inserted && !event.processedAt) {
    const createdAtMillis = Date.parse(event.createdAt);
    const eventAgeMillis = Number.isFinite(createdAtMillis)
      ? Date.now() - createdAtMillis
      : Number.POSITIVE_INFINITY;

    if (eventAgeMillis >= 0 && eventAgeMillis < DUPLICATE_IN_FLIGHT_WINDOW_MS) {
      console.info("Fondy webhook: duplicate in-flight event acknowledged", {
        paymentEventId: event.id,
        orderId,
        providerOrderId,
        eventType,
      });
      return textResponse("OK");
    }
  }

  let paymentAttempt =
    providerOrderId ? await findLatestPaymentAttemptByProviderOrderId(db, providerOrderId) : null;

  let order = orderId ? await findOrderByIdWithCustomerAndProduct(db, orderId) : null;
  if (!order && paymentAttempt) {
    order = await findOrderByIdWithCustomerAndProduct(db, paymentAttempt.orderId);
  }

  if (!paymentAttempt && order) {
    paymentAttempt = await findLatestPaymentAttemptByOrderId(db, order.id);
  }

  if (!order) {
    console.error("Fondy webhook: order not found", {
      paymentEventId: event.id,
      orderId,
      providerOrderId,
      eventType,
    });
    await markPaymentEventProcessed(db, event.id);
    return textResponse("OK");
  }

  const callbackAmount = toMinorAmount(payload.amount);
  const callbackCurrency = toUpperCurrency(payload.currency);
  const mismatchReasons: string[] = [];

  if (callbackAmount === null || callbackAmount !== order.amountMinor) {
    mismatchReasons.push("amount_mismatch");
  }

  if (!callbackCurrency || callbackCurrency !== order.currency.toUpperCase()) {
    mismatchReasons.push("currency_mismatch");
  }

  const outcome = mapFondyWebhookOutcome(payload);
  const providerPaymentId = getProviderPaymentId(payload);
  const attemptPayloadJson = JSON.stringify({
    webhook: payload,
  });

  if (mismatchReasons.length > 0 || outcome === "unknown") {
    await markOrderAsManualReview(db, order.id);

    if (paymentAttempt) {
      await updatePaymentAttemptStatus(db, {
        id: paymentAttempt.id,
        status: "failed",
        providerOrderId: providerOrderId ?? paymentAttempt.providerOrderId,
        providerPaymentId: providerPaymentId ?? paymentAttempt.providerPaymentId,
        rawStatus: `manual_review:${eventType}`,
        payloadJson: attemptPayloadJson,
      });
    }

    console.error("Fondy webhook: manual review required", {
      paymentEventId: event.id,
      orderId: order.id,
      providerOrderId,
      eventType,
      outcome,
      mismatchReasons,
      callbackAmount,
      callbackCurrency,
    });

    await markPaymentEventProcessed(db, event.id);
    return textResponse("OK");
  }

  if (outcome === "paid") {
    await markOrderAsPaid(db, order.id);

    if (paymentAttempt) {
      await updatePaymentAttemptStatus(db, {
        id: paymentAttempt.id,
        status: "paid",
        providerOrderId: providerOrderId ?? paymentAttempt.providerOrderId,
        providerPaymentId: providerPaymentId ?? paymentAttempt.providerPaymentId,
        rawStatus: eventType,
        payloadJson: attemptPayloadJson,
      });
    }

    const fulfillmentResult = await fulfillPaidProductDelivery(db, {
      orderId: order.id,
      allowResendEmail: false,
      forceNewToken: false,
    });

    console.info("Fondy webhook: payment confirmed", {
      paymentEventId: event.id,
      orderId: order.id,
      providerOrderId,
      providerPaymentId,
      outcome,
      fulfillmentResult: fulfillmentResult.status,
    });

    await markPaymentEventProcessed(db, event.id);
    return textResponse("OK");
  }

  if (outcome === "failed") {
    await markOrderAsFailed(db, order.id);

    if (paymentAttempt) {
      await updatePaymentAttemptStatus(db, {
        id: paymentAttempt.id,
        status: "failed",
        providerOrderId: providerOrderId ?? paymentAttempt.providerOrderId,
        providerPaymentId: providerPaymentId ?? paymentAttempt.providerPaymentId,
        rawStatus: eventType,
        payloadJson: attemptPayloadJson,
      });
    }

    await markPaymentEventProcessed(db, event.id);
    return textResponse("OK");
  }

  if (outcome === "expired") {
    await markOrderAsExpired(db, order.id);

    if (paymentAttempt) {
      await updatePaymentAttemptStatus(db, {
        id: paymentAttempt.id,
        status: "expired",
        providerOrderId: providerOrderId ?? paymentAttempt.providerOrderId,
        providerPaymentId: providerPaymentId ?? paymentAttempt.providerPaymentId,
        rawStatus: eventType,
        payloadJson: attemptPayloadJson,
      });
    }

    await markPaymentEventProcessed(db, event.id);
    return textResponse("OK");
  }

  await markOrderAsProcessing(db, order.id);

  if (paymentAttempt) {
    await updatePaymentAttemptStatus(db, {
      id: paymentAttempt.id,
      status: "pending",
      providerOrderId: providerOrderId ?? paymentAttempt.providerOrderId,
      providerPaymentId: providerPaymentId ?? paymentAttempt.providerPaymentId,
      rawStatus: eventType,
      payloadJson: attemptPayloadJson,
    });
  }

  await markPaymentEventProcessed(db, event.id);
  return textResponse("OK");
}
