import { createHash } from "node:crypto";

const FONDY_CHECKOUT_URL_ENDPOINT = "https://pay.fondy.eu/api/checkout/url";
const FONDY_REQUEST_USER_AGENT = "tetibetti-site/1.0 (+https://www.tetibetti.com)";
const CHECKOUT_SUCCESS_PATH = "/checkout/success";
const CHECKOUT_FAILED_PATH = "/checkout/failed";
const INCLUDE_DECLINE_URL_IN_FONDY_PAYLOAD = false;
const FONDY_COMPATIBILITY_PRODUCT_ID = "Fondy";
const FONDY_MINIMAL_COMPAT_PAYLOAD_MODE_DEFAULT = false;
const ERROR_MESSAGE_MAX_LENGTH = 300;
const RAW_BODY_PREVIEW_MAX_LENGTH = 500;

type FondyCheckoutRequest = {
  merchant_id: number;
  order_id: string;
  order_desc: string;
  amount: number;
  currency: string;
  sender_email: string;
  product_id: string;
  response_url: string;
  server_callback_url: string;
  decline_url?: string;
  merchant_data?: string;
};

type FondyCheckoutApiResponse = {
  response?: {
    response_status?: string;
    checkout_url?: string;
    error_message?: string;
    error_code?: string;
    [key: string]: unknown;
  };
};

export class InvalidFondyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidFondyConfigError";
  }
}

export class FondyProviderError extends Error {
  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "FondyProviderError";
    this.details = details;
  }
}

export type BuildFondyCheckoutPayloadInput = {
  merchantId: string;
  secretKey: string;
  appBaseUrl: string;
  orderId: string;
  amountMinor: number;
  currency: string;
  productName: string;
  customerEmail: string;
};

export type FondyCheckoutSession = {
  checkoutUrl: string;
  providerOrderId: string;
  requestPayload: FondyCheckoutRequest & { signature: string };
  rawResponse: FondyCheckoutApiResponse["response"];
};

const compactFondyPayload = (
  payload: Record<string, unknown>,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(payload)
      .filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );

const SIGNATURE_EXCLUDED_FONDY_KEYS = new Set(["signature"]);

const getSignatureMaterial = (payload: Record<string, unknown>) => {
  const cleanPayload = compactFondyPayload(payload);
  const entries = Object.entries(cleanPayload)
    .filter(([key]) => !SIGNATURE_EXCLUDED_FONDY_KEYS.has(key))
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => [key, String(value)] as const);

  return {
    orderedFieldNames: entries.map(([key]) => key),
    orderedFieldValues: entries.map(([, value]) => value),
  };
};

const getPayloadFieldNamesForSignatureCheck = (payload: Record<string, unknown>): string[] =>
  Object.keys(compactFondyPayload(payload))
    .filter((key) => !SIGNATURE_EXCLUDED_FONDY_KEYS.has(key))
    .sort();

const compareSignatureFieldSetWithPayload = (
  payload: Record<string, unknown>,
  signedFieldNames: readonly string[],
) => {
  const normalizedSignedFieldNames = [...signedFieldNames].sort();
  const payloadFieldNamesForSignatureCheck = getPayloadFieldNamesForSignatureCheck(payload);
  const payloadFieldSet = new Set(payloadFieldNamesForSignatureCheck);
  const signedFieldSet = new Set(normalizedSignedFieldNames);
  const payloadFieldsMissingFromSignature = payloadFieldNamesForSignatureCheck.filter(
    (fieldName) => !signedFieldSet.has(fieldName),
  );
  const signedFieldsMissingFromPayload = normalizedSignedFieldNames.filter(
    (fieldName) => !payloadFieldSet.has(fieldName),
  );

  return {
    signedFieldNames: normalizedSignedFieldNames,
    payloadFieldNamesForSignatureCheck,
    payloadFieldsMissingFromSignature,
    signedFieldsMissingFromPayload,
    signatureFieldSetMatchesPayload:
      payloadFieldsMissingFromSignature.length === 0 && signedFieldsMissingFromPayload.length === 0,
  };
};

const isFondyMinimalCompatPayloadModeEnabled = (): boolean => {
  const flag = (process.env.FONDY_MINIMAL_COMPAT_PAYLOAD_MODE ?? "").toLowerCase();
  if (flag === "1" || flag === "true") {
    return true;
  }
  if (flag === "0" || flag === "false") {
    return false;
  }
  return FONDY_MINIMAL_COMPAT_PAYLOAD_MODE_DEFAULT;
};

const createFondySignature = (payload: Record<string, unknown>, secretKey: string) => {
  const signatureMaterial = getSignatureMaterial(payload);
  const signatureInput = `${secretKey}|${signatureMaterial.orderedFieldValues.join("|")}`;

  return {
    signature: createHash("sha1").update(signatureInput, "utf8").digest("hex").toLowerCase(),
    signatureMaterial,
  };
};

const toProviderResponseSummary = (
  responsePayload: FondyCheckoutApiResponse["response"],
  fallbackRawText?: string,
): Record<string, unknown> => {
  const rawBodyPreview = fallbackRawText
    ? fallbackRawText.replace(/\s+/g, " ").trim().slice(0, RAW_BODY_PREVIEW_MAX_LENGTH)
    : null;

  return {
    responseStatus:
      typeof responsePayload?.response_status === "string"
        ? responsePayload.response_status
        : null,
    errorCode:
      typeof responsePayload?.error_code === "string" ? responsePayload.error_code : null,
    errorMessage:
      typeof responsePayload?.error_message === "string"
        ? responsePayload.error_message.slice(0, ERROR_MESSAGE_MAX_LENGTH)
        : null,
    rawBodyPreview,
  };
};

export const buildFondyOrderReference = (orderId: string): string => `tb_${orderId}`;

const toFondyMerchantId = (merchantId: string): number => {
  const parsed = Number.parseInt(merchantId, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new InvalidFondyConfigError("Invalid FONDY_MERCHANT_ID");
  }
  return parsed;
};

const buildOrderDescription = (productName: string): string => productName.slice(0, 255);

const buildSuccessUrl = (appBaseUrl: string, orderId: string): string =>
  new URL(`${CHECKOUT_SUCCESS_PATH}?orderId=${encodeURIComponent(orderId)}`, appBaseUrl).toString();

const buildFailedUrl = (appBaseUrl: string, orderId: string): string =>
  new URL(`${CHECKOUT_FAILED_PATH}?orderId=${encodeURIComponent(orderId)}`, appBaseUrl).toString();

const buildWebhookUrl = (appBaseUrl: string): string =>
  new URL("/api/payments/webhook/fondy", appBaseUrl).toString();

export const buildFondyCheckoutPayload = (
  input: BuildFondyCheckoutPayloadInput,
): {
  providerOrderId: string;
  payload: FondyCheckoutRequest & { signature: string };
} => {
  const providerOrderId = buildFondyOrderReference(input.orderId);
  const successUrl = buildSuccessUrl(input.appBaseUrl, input.orderId);
  const failedUrl = buildFailedUrl(input.appBaseUrl, input.orderId);
  const callbackUrl = buildWebhookUrl(input.appBaseUrl);
  const minimalCompatPayloadMode = isFondyMinimalCompatPayloadModeEnabled();
  const basePayload = {
    merchant_id: toFondyMerchantId(input.merchantId),
    order_id: providerOrderId,
    amount: input.amountMinor,
    order_desc: buildOrderDescription(input.productName),
    sender_email: input.customerEmail,
    product_id: FONDY_COMPATIBILITY_PRODUCT_ID,
    server_callback_url: callbackUrl,
    response_url: successUrl,
    currency: input.currency.toUpperCase(),
  };

  const payloadWithoutSignature = minimalCompatPayloadMode
    ? compactFondyPayload(basePayload)
    : compactFondyPayload({
        ...basePayload,
        ...(INCLUDE_DECLINE_URL_IN_FONDY_PAYLOAD
          ? {
              decline_url: failedUrl,
            }
          : {}),
        merchant_data: JSON.stringify({ orderId: input.orderId }),
      });

  const { signature, signatureMaterial } = createFondySignature(payloadWithoutSignature, input.secretKey);

  const requestPayload = {
    ...payloadWithoutSignature,
    signature,
  } as FondyCheckoutRequest & { signature: string };

  const signatureFieldSetComparison = compareSignatureFieldSetWithPayload(
    requestPayload,
    signatureMaterial.orderedFieldNames,
  );

  if (!signatureFieldSetComparison.signatureFieldSetMatchesPayload) {
    throw new InvalidFondyConfigError(
      "Fondy signature field set does not match outgoing payload field set",
    );
  }

  return {
    providerOrderId,
    payload: requestPayload,
  };
};

export const startFondyCheckoutSession = async (
  payload: FondyCheckoutRequest & { signature: string },
): Promise<{ checkoutUrl: string; rawResponse: FondyCheckoutApiResponse["response"] }> => {
  let parsedBody: FondyCheckoutApiResponse | null = null;
  let rawText = "";
  const signedFieldNames = getSignatureMaterial(payload).orderedFieldNames;
  const signatureFieldSetComparison = compareSignatureFieldSetWithPayload(
    payload,
    signedFieldNames,
  );

  if (!signatureFieldSetComparison.signatureFieldSetMatchesPayload) {
    throw new InvalidFondyConfigError(
      "Fondy request payload/signature field mismatch detected before request send",
    );
  }

  const response = await fetch(FONDY_CHECKOUT_URL_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "user-agent": FONDY_REQUEST_USER_AGENT,
    },
    body: JSON.stringify({
      request: payload,
    }),
  });

  rawText = await response.text();

  try {
    parsedBody = JSON.parse(rawText) as FondyCheckoutApiResponse;
  } catch {
    parsedBody = null;
  }

  if (!response.ok) {
    throw new FondyProviderError(`Fondy checkout request failed with HTTP ${response.status}`, {
      httpStatus: response.status,
      endpoint: FONDY_CHECKOUT_URL_ENDPOINT,
      ...toProviderResponseSummary(parsedBody?.response, rawText),
    });
  }

  const responsePayload = parsedBody?.response;
  const checkoutUrl = responsePayload?.checkout_url;
  const responseStatus = responsePayload?.response_status;
  if (responseStatus !== "success" || !checkoutUrl) {
    throw new FondyProviderError("Fondy checkout session was not created", {
      httpStatus: response.status,
      endpoint: FONDY_CHECKOUT_URL_ENDPOINT,
      signedFieldNames,
      ...toProviderResponseSummary(responsePayload, rawText),
    });
  }

  return {
    checkoutUrl,
    rawResponse: responsePayload,
  };
};
