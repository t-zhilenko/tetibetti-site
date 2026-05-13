export type MonoWebhookPayload = Record<string, unknown> & {
  invoiceId?: unknown;
  status?: unknown;
  amount?: unknown;
  ccy?: unknown;
  modifiedDate?: unknown;
  reference?: unknown;
  merchantPaymInfo?: unknown;
};

export type MonoWebhookOutcome = "paid" | "failed" | "expired" | "processing";

type MonoPubKeyResponse = {
  key?: unknown;
};

const MONO_PUBKEY_PATH = "/api/merchant/pubkey";

const normalizeStatus = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().toLowerCase();
};

const decodeBase64 = (value: string): Uint8Array => {
  if (typeof atob === "function") {
    const text = atob(value);
    const bytes = new Uint8Array(text.length);
    for (let index = 0; index < text.length; index += 1) {
      bytes[index] = text.charCodeAt(index);
    }
    return bytes;
  }

  throw new Error("Base64 decoding is not available in this runtime");
};

const toPemBody = (pemText: string): string => {
  const body = pemText
    .replace(/-----BEGIN PUBLIC KEY-----/g, "")
    .replace(/-----END PUBLIC KEY-----/g, "")
    .replace(/\s+/g, "");

  if (!body) {
    throw new Error("Invalid Mono public key format");
  }

  return body;
};

const toIsoDateMillis = (value: unknown): number | null => {
  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = value > 1_000_000_000_000 ? value : value * 1000;
    return Number.isFinite(normalized) ? Math.trunc(normalized) : null;
  }

  return null;
};

export const normalizeMonoWebhookPayload = (rawPayload: unknown): MonoWebhookPayload | null => {
  if (!rawPayload || typeof rawPayload !== "object" || Array.isArray(rawPayload)) {
    return null;
  }
  return rawPayload as MonoWebhookPayload;
};

export const mapMonoWebhookOutcome = (statusRaw: unknown): MonoWebhookOutcome => {
  const status = normalizeStatus(statusRaw);
  if (status === "success") {
    return "paid";
  }

  if (status === "failure" || status === "reversed") {
    return "failed";
  }

  if (status === "expired") {
    return "expired";
  }

  return "processing";
};

export const getMonoEventType = (payload: MonoWebhookPayload): string => {
  const normalized = normalizeStatus(payload.status);
  return normalized || "unknown";
};

export const extractMonoOrderReference = (payload: MonoWebhookPayload): string | null => {
  if (typeof payload.reference === "string" && payload.reference.trim()) {
    return payload.reference.trim();
  }

  if (
    payload.merchantPaymInfo &&
    typeof payload.merchantPaymInfo === "object" &&
    !Array.isArray(payload.merchantPaymInfo) &&
    typeof (payload.merchantPaymInfo as { reference?: unknown }).reference === "string"
  ) {
    const value = ((payload.merchantPaymInfo as { reference?: unknown }).reference as string).trim();
    if (value) {
      return value;
    }
  }

  return null;
};

export const extractMonoInvoiceId = (payload: MonoWebhookPayload): string | null => {
  if (typeof payload.invoiceId !== "string") {
    return null;
  }
  const value = payload.invoiceId.trim();
  return value || null;
};

export const extractMonoAmountMinor = (payload: MonoWebhookPayload): number | null => {
  if (typeof payload.amount === "number" && Number.isFinite(payload.amount)) {
    return Math.trunc(payload.amount);
  }

  if (typeof payload.amount === "string" && payload.amount.trim()) {
    const parsed = Number.parseInt(payload.amount, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const extractMonoCurrencyCode = (payload: MonoWebhookPayload): number | null => {
  if (typeof payload.ccy === "number" && Number.isFinite(payload.ccy)) {
    return Math.trunc(payload.ccy);
  }

  if (typeof payload.ccy === "string" && payload.ccy.trim()) {
    const parsed = Number.parseInt(payload.ccy, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const extractMonoModifiedDateMs = (payload: MonoWebhookPayload): number | null =>
  toIsoDateMillis(payload.modifiedDate);

export const sha256HexWeb = async (value: string): Promise<string> => {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const fetchMonoPublicKeyPem = async (
  monoApiBaseUrl: string,
  monoToken: string,
): Promise<string> => {
  const endpoint = new URL(MONO_PUBKEY_PATH, monoApiBaseUrl).toString();
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "x-token": monoToken,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load Mono webhook public key: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as MonoPubKeyResponse;
  if (typeof payload.key !== "string" || !payload.key.trim()) {
    throw new Error("Mono webhook public key response is missing key");
  }

  const decoded = decodeBase64(payload.key.trim());
  return new TextDecoder().decode(decoded);
};

const importMonoPublicKey = async (
  monoApiBaseUrl: string,
  monoToken: string,
): Promise<CryptoKey> => {
  const pemText = await fetchMonoPublicKeyPem(monoApiBaseUrl, monoToken);
  const der = decodeBase64(toPemBody(pemText));
  const derBuffer = der.buffer.slice(der.byteOffset, der.byteOffset + der.byteLength) as ArrayBuffer;

  return crypto.subtle.importKey(
    "spki",
    derBuffer,
    {
      name: "ECDSA",
      namedCurve: "P-256",
    },
    false,
    ["verify"],
  );
};

export const verifyMonoWebhookSignature = async (
  rawBody: string,
  xSign: string,
  monoApiBaseUrl: string,
  monoToken: string,
): Promise<boolean> => {
  const signature = xSign.trim();
  if (!signature) {
    return false;
  }

  const publicKey = await importMonoPublicKey(monoApiBaseUrl, monoToken);
  const signatureBytes = decodeBase64(signature);
  const bodyBytes = new TextEncoder().encode(rawBody);
  const signatureBuffer = signatureBytes.buffer.slice(
    signatureBytes.byteOffset,
    signatureBytes.byteOffset + signatureBytes.byteLength,
  ) as ArrayBuffer;
  const bodyBuffer = bodyBytes.buffer.slice(
    bodyBytes.byteOffset,
    bodyBytes.byteOffset + bodyBytes.byteLength,
  ) as ArrayBuffer;

  return crypto.subtle.verify(
    {
      name: "ECDSA",
      hash: "SHA-256",
    },
    publicKey,
    signatureBuffer,
    bodyBuffer,
  );
};
