import { safeEqual, sha1Hex } from "@/lib/server/security";

export type FondyWebhookPayload = Record<string, unknown> & {
  order_id?: unknown;
  payment_id?: unknown;
  amount?: unknown;
  currency?: unknown;
  order_status?: unknown;
  response_status?: unknown;
  payment_status?: unknown;
  merchant_data?: unknown;
  signature?: unknown;
};

type FondySignatureMaterial = {
  orderedFieldNames: string[];
  orderedFieldValues: string[];
};

export type FondyWebhookOutcome = "paid" | "failed" | "expired" | "processing" | "unknown";

const SIGNATURE_EXCLUDED_KEYS = new Set(["signature"]);

const compactPayload = (payload: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );

const getSignatureMaterial = (payload: Record<string, unknown>): FondySignatureMaterial => {
  const entries = Object.entries(compactPayload(payload))
    .filter(([key]) => !SIGNATURE_EXCLUDED_KEYS.has(key))
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => [key, String(value)] as const);

  return {
    orderedFieldNames: entries.map(([key]) => key),
    orderedFieldValues: entries.map(([, value]) => value),
  };
};

const getNormalizedStatus = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
};

export const getFondySignatureMaterial = (payload: Record<string, unknown>): FondySignatureMaterial =>
  getSignatureMaterial(payload);

export const createFondyWebhookSignature = (
  payload: Record<string, unknown>,
  secretKey: string,
): { signature: string; signatureMaterial: FondySignatureMaterial } => {
  const signatureMaterial = getSignatureMaterial(payload);
  const signatureInput = `${secretKey}|${signatureMaterial.orderedFieldValues.join("|")}`;

  return {
    signature: sha1Hex(signatureInput),
    signatureMaterial,
  };
};

export const validateFondyWebhookSignature = (
  payload: FondyWebhookPayload,
  secretKey: string,
): { isValid: boolean; expectedSignature: string; providedSignature: string; signatureMaterial: FondySignatureMaterial } => {
  const providedSignature =
    typeof payload.signature === "string" ? payload.signature.trim().toLowerCase() : "";
  const { signature: expectedSignature, signatureMaterial } = createFondyWebhookSignature(
    payload,
    secretKey,
  );

  return {
    isValid:
      Boolean(providedSignature) &&
      safeEqual(providedSignature, expectedSignature),
    expectedSignature,
    providedSignature,
    signatureMaterial,
  };
};

export const extractFondyOrderIds = (
  payload: FondyWebhookPayload,
): { orderId: string | null; providerOrderId: string | null } => {
  const providerOrderId =
    typeof payload.order_id === "string" && payload.order_id.trim() ? payload.order_id.trim() : null;

  let orderId: string | null = null;
  if (providerOrderId?.startsWith("tb_")) {
    orderId = providerOrderId.slice(3);
  }

  if (!orderId && typeof payload.merchant_data === "string" && payload.merchant_data.trim()) {
    try {
      const parsed = JSON.parse(payload.merchant_data) as { orderId?: unknown };
      if (typeof parsed.orderId === "string" && parsed.orderId.trim()) {
        orderId = parsed.orderId.trim();
      }
    } catch {
      // Ignore merchant_data parse errors and continue with provider order reference only.
    }
  }

  return {
    orderId,
    providerOrderId,
  };
};

export const toMinorAmount = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
};

export const toUpperCurrency = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  return normalized || null;
};

export const getFondyEventType = (payload: FondyWebhookPayload): string => {
  const orderStatus = getNormalizedStatus(payload.order_status);
  const paymentStatus = getNormalizedStatus(payload.payment_status);
  const responseStatus = getNormalizedStatus(payload.response_status);
  return orderStatus || paymentStatus || responseStatus || "unknown";
};

export const mapFondyWebhookOutcome = (payload: FondyWebhookPayload): FondyWebhookOutcome => {
  const statuses = [
    getNormalizedStatus(payload.order_status),
    getNormalizedStatus(payload.payment_status),
    getNormalizedStatus(payload.response_status),
  ].filter(Boolean);

  if (statuses.some((status) => ["approved", "success", "completed", "paid"].includes(status))) {
    return "paid";
  }

  if (statuses.some((status) => ["declined", "failed", "rejected", "error"].includes(status))) {
    return "failed";
  }

  if (statuses.some((status) => ["expired", "canceled", "cancelled", "timeout", "voided"].includes(status))) {
    return "expired";
  }

  if (statuses.some((status) => ["created", "processing", "pending", "in_process"].includes(status))) {
    return "processing";
  }

  return "unknown";
};

export const normalizeFondyWebhookPayload = (rawPayload: unknown): FondyWebhookPayload | null => {
  if (!rawPayload || typeof rawPayload !== "object") {
    return null;
  }

  if (
    "request" in rawPayload &&
    rawPayload.request &&
    typeof rawPayload.request === "object" &&
    !Array.isArray(rawPayload.request)
  ) {
    return rawPayload.request as FondyWebhookPayload;
  }

  return rawPayload as FondyWebhookPayload;
};
