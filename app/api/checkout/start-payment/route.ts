import { isPaidProduct, isProductPurchasable } from "@/lib/payments/product-helpers";
import {
  NOT_PAYABLE_ORDER_STATUSES,
  NOT_PAYABLE_PAYMENT_ATTEMPT_STATUSES,
} from "@/lib/payments/status-helpers";
import { getDb } from "@/lib/server/db";
import {
  InvalidBaseUrlEnvError,
  MissingPaymentEnvError,
  getPaymentProvider,
  getRequiredFondyEnv,
} from "@/lib/server/env";
import {
  FondyProviderError,
  InvalidFondyConfigError,
  buildFondyCheckoutPayload,
  startFondyCheckoutSession,
} from "@/lib/server/payments/fondy";
import {
  MonoProviderError,
} from "@/lib/server/payments/providers/mono";
import {
  getPaymentProviderClient,
  UnsupportedPaymentProviderError,
} from "@/lib/server/payments/payment-provider";
import { findCustomerById } from "@/lib/server/repositories/customers";
import { findOrderById, markOrderAsProcessing } from "@/lib/server/repositories/orders";
import {
  createPaymentAttempt,
  findLatestPaymentAttemptByOrderId,
  updatePaymentAttemptCheckout,
} from "@/lib/server/repositories/paymentAttempts";
import { getProductById } from "@/lib/server/repositories/products";
import { isUuid } from "@/lib/server/security";

type StartPaymentPayload = {
  orderId?: unknown;
  locale?: unknown;
};

type CheckoutLocale = "en" | "uk";

const SUPPORTED_CHECKOUT_LOCALES = new Set<CheckoutLocale>(["en", "uk"]);

type ErrorCode =
  | "INVALID_JSON"
  | "MISSING_ORDER_ID"
  | "INVALID_ORDER_ID"
  | "ORDER_NOT_FOUND"
  | "ORDER_NOT_PAYABLE"
  | "BAD_PRODUCT_TYPE"
  | "PAYMENT_CONFIG_MISSING"
  | "PAYMENT_PROVIDER_ERROR"
  | "START_PAYMENT_FAILED";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

const errorResponse = (code: ErrorCode, message: string, status: number) =>
  jsonResponse(
    {
      ok: false,
      code,
      message,
    },
    status,
  );

export async function POST(request: Request) {
  let payload: StartPaymentPayload;
  const cfRay = request.headers.get("cf-ray");
  let logOrderId: string | null = null;
  let logPaymentAttemptId: string | null = null;
  let logProviderOrderId: string | null = null;
  let logProvider: string | null = null;
  let logAmountMinor: number | null = null;
  let logCurrency: string | null = null;

  try {
    payload = (await request.json()) as StartPaymentPayload;
  } catch {
    return errorResponse("INVALID_JSON", "Invalid JSON", 400);
  }

  const orderId = typeof payload.orderId === "string" ? payload.orderId.trim() : "";
  const localeRaw = typeof payload.locale === "string" ? payload.locale.trim().toLowerCase() : "";
  const locale = SUPPORTED_CHECKOUT_LOCALES.has(localeRaw as CheckoutLocale)
    ? (localeRaw as CheckoutLocale)
    : undefined;
  if (!orderId) {
    return errorResponse("MISSING_ORDER_ID", "Missing orderId", 400);
  }
  if (!isUuid(orderId)) {
    return errorResponse("INVALID_ORDER_ID", "Invalid orderId", 400);
  }

  try {
    const db = await getDb();
    const order = await findOrderById(db, orderId);
    logOrderId = orderId;

    if (!order) {
      return errorResponse("ORDER_NOT_FOUND", "Order not found", 404);
    }
    logAmountMinor = order.amountMinor;
    logCurrency = order.currency;

    if (NOT_PAYABLE_ORDER_STATUSES.has(order.status)) {
      return errorResponse("ORDER_NOT_PAYABLE", "Order is not payable", 409);
    }

    const product = await getProductById(db, order.productId);
    if (!product) {
      return errorResponse("START_PAYMENT_FAILED", "Unable to start payment", 500);
    }

    if (!isPaidProduct(product)) {
      return errorResponse("BAD_PRODUCT_TYPE", "Order product is not payable", 409);
    }

    if (!isProductPurchasable(product)) {
      return errorResponse("ORDER_NOT_PAYABLE", "Order is not payable", 409);
    }

    const customer = await findCustomerById(db, order.customerId);
    if (!customer) {
      return errorResponse("START_PAYMENT_FAILED", "Unable to start payment", 500);
    }

    const paymentProvider = await getPaymentProvider();
    logProvider = paymentProvider;

    let paymentAttempt = await findLatestPaymentAttemptByOrderId(db, order.id);
    const attemptNeedsReset =
      !paymentAttempt ||
      paymentAttempt.provider !== paymentProvider ||
      paymentAttempt.amountMinor !== order.amountMinor ||
      paymentAttempt.currency.toUpperCase() !== order.currency.toUpperCase();

    if (attemptNeedsReset) {
      paymentAttempt = await createPaymentAttempt(db, {
        id: crypto.randomUUID(),
        orderId: order.id,
        provider: paymentProvider,
        status: "created",
        amountMinor: order.amountMinor,
        currency: order.currency,
      });
    }
    if (!paymentAttempt) {
      return errorResponse("START_PAYMENT_FAILED", "Unable to start payment", 500);
    }
    logPaymentAttemptId = paymentAttempt.id;

    if (NOT_PAYABLE_PAYMENT_ATTEMPT_STATUSES.has(paymentAttempt.status)) {
      return errorResponse("ORDER_NOT_PAYABLE", "Order is not payable", 409);
    }

    if (paymentProvider === "mono") {
      const monoProvider = await getPaymentProviderClient();
      const checkoutSession = await monoProvider.createPayment({
        orderId: order.id,
        productSlug: product.slug,
        productName: product.name,
        amount: order.amountMinor / 100,
        email: customer.email,
        locale: locale ?? "en",
      });
      logProviderOrderId = checkoutSession.providerInvoiceId;

      await updatePaymentAttemptCheckout(db, {
        id: paymentAttempt.id,
        providerOrderId: checkoutSession.providerInvoiceId,
        status: "pending",
        rawStatus: "created",
        payloadJson: JSON.stringify({
          request: {
            provider: "mono",
            orderId: order.id,
            productSlug: product.slug,
            amountMinor: order.amountMinor,
            currency: order.currency,
            locale: locale ?? "en",
          },
          response: {
            invoiceId: checkoutSession.providerInvoiceId,
            pageUrl: checkoutSession.paymentUrl,
          },
        }),
      });

      await markOrderAsProcessing(db, order.id);

      console.info("Start-payment checkout initialized", {
        provider: "mono",
        orderId: order.id,
        paymentAttemptId: paymentAttempt.id,
        providerInvoiceId: checkoutSession.providerInvoiceId,
      });

      return jsonResponse({
        ok: true,
        orderId: order.id,
        paymentUrl: checkoutSession.paymentUrl,
        checkout: {
          provider: "mono",
          method: "redirect",
          checkoutUrl: checkoutSession.paymentUrl,
        },
      });
    }

    const env = await getRequiredFondyEnv();
    const { providerOrderId, payload: fondyPayload } = buildFondyCheckoutPayload({
      merchantId: env.fondyMerchantId,
      secretKey: env.fondySecretKey,
      appBaseUrl: env.appBaseUrl,
      locale,
      orderId: order.id,
      amountMinor: order.amountMinor,
      currency: order.currency,
      productName: product.name,
      customerEmail: customer.email,
    });
    logProviderOrderId = providerOrderId;

    const checkoutSession = await startFondyCheckoutSession(fondyPayload);
    const rawStatus =
      typeof checkoutSession.rawResponse?.response_status === "string"
        ? checkoutSession.rawResponse.response_status
        : null;

    await updatePaymentAttemptCheckout(db, {
      id: paymentAttempt.id,
      providerOrderId,
      status: "pending",
      rawStatus,
      payloadJson: JSON.stringify({
        request: fondyPayload,
        response: checkoutSession.rawResponse ?? null,
      }),
    });

    await markOrderAsProcessing(db, order.id);

    console.info("Start-payment checkout initialized", {
      provider: "fondy",
      orderId: order.id,
      paymentAttemptId: paymentAttempt.id,
      providerOrderId,
      responseStatus: rawStatus,
    });

    return jsonResponse({
      ok: true,
      checkout: {
        provider: "fondy",
        method: "redirect",
        checkoutUrl: checkoutSession.checkoutUrl,
      },
    });
  } catch (error) {
    if (
      error instanceof MissingPaymentEnvError ||
      error instanceof InvalidFondyConfigError ||
      error instanceof InvalidBaseUrlEnvError ||
      error instanceof UnsupportedPaymentProviderError
    ) {
      console.error("Start-payment config error", {
        message: error.message,
        provider: logProvider,
        orderId: logOrderId,
        paymentAttemptId: logPaymentAttemptId,
        cfRay,
      });
      return errorResponse("PAYMENT_CONFIG_MISSING", "Payment configuration is not available", 500);
    }

    if (error instanceof FondyProviderError || error instanceof MonoProviderError) {
      console.error("Start-payment provider error", {
        message: error.message,
        provider: logProvider,
        orderId: logOrderId,
        paymentAttemptId: logPaymentAttemptId,
        providerOrderId: logProviderOrderId,
        amountMinor: logAmountMinor,
        currency: logCurrency,
        httpStatus:
          typeof error.details?.httpStatus === "number" ? error.details.httpStatus : undefined,
        errorCode:
          typeof error.details?.errorCode === "string"
            ? error.details.errorCode
            : typeof error.details?.errCode === "string"
              ? error.details.errCode
              : undefined,
        errorMessage:
          typeof error.details?.errorMessage === "string"
            ? error.details.errorMessage
            : typeof error.details?.errText === "string"
              ? error.details.errText
            : undefined,
        endpoint:
          typeof error.details?.endpoint === "string" ? error.details.endpoint : undefined,
        rawBodyPreview:
          typeof error.details?.rawBodyPreview === "string"
            ? error.details.rawBodyPreview
            : undefined,
        cfRay,
      });
      return errorResponse("PAYMENT_PROVIDER_ERROR", "Unable to initialize payment", 502);
    }

    console.error("Start-payment failed", {
      message: error instanceof Error ? error.message : "Unknown error",
      provider: logProvider,
      orderId: logOrderId,
      paymentAttemptId: logPaymentAttemptId,
      providerOrderId: logProviderOrderId,
      cfRay,
    });
    return errorResponse("START_PAYMENT_FAILED", "Unable to start payment", 500);
  }
}
