import type { CreatePaymentInput, CreatePaymentResult, PaymentProviderClient } from "@/lib/server/payments/payment-provider";

type MonoEnv = {
  monoToken: string;
  monoApiBaseUrl: string;
  monoWebhookUrl: string;
  appBaseUrl: string;
};

type MonoCreateInvoiceResponse = {
  invoiceId?: unknown;
  pageUrl?: unknown;
  errCode?: unknown;
  errText?: unknown;
};

const MONO_INVOICE_CREATE_PATH = "/api/merchant/invoice/create";
const MONO_PAYMENT_CCY_UAH = 980;
const MONO_PAYMENT_VALIDITY_SECONDS = 86400;
const ERROR_MESSAGE_MAX_LENGTH = 300;

export class MonoProviderError extends Error {
  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "MonoProviderError";
    this.details = details;
  }
}

const toCheckoutResultUrl = (appBaseUrl: string, locale: "uk" | "en", orderId: string): string =>
  new URL(`/${locale}/checkout/result?orderId=${encodeURIComponent(orderId)}`, appBaseUrl).toString();

const toMonoAmountMinor = (amountMajor: number): number => Math.round(amountMajor * 100);

const normalizeErrorText = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  if (!normalized) {
    return null;
  }
  return normalized.slice(0, ERROR_MESSAGE_MAX_LENGTH);
};

const parseMonoResponse = async (response: Response): Promise<MonoCreateInvoiceResponse> => {
  try {
    return (await response.json()) as MonoCreateInvoiceResponse;
  } catch {
    return {};
  }
};

export const createMonoPaymentProvider = (env: MonoEnv): PaymentProviderClient => {
  const endpoint = new URL(MONO_INVOICE_CREATE_PATH, env.monoApiBaseUrl).toString();

  return {
    provider: "mono",
    async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
      const amountMinor = toMonoAmountMinor(input.amount);
      const redirectUrl = toCheckoutResultUrl(env.appBaseUrl, input.locale, input.orderId);

      console.info("Mono invoice creation started", {
        orderId: input.orderId,
        productSlug: input.productSlug,
        amountMinor,
        ccy: MONO_PAYMENT_CCY_UAH,
      });

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-token": env.monoToken,
        },
        body: JSON.stringify({
          amount: amountMinor,
          ccy: MONO_PAYMENT_CCY_UAH,
          paymentType: "debit",
          merchantPaymInfo: {
            reference: input.orderId,
            destination: `${input.productName} - Teti Betti`,
            comment: `Order ${input.orderId}`,
          },
          redirectUrl,
          webHookUrl: env.monoWebhookUrl,
          validity: MONO_PAYMENT_VALIDITY_SECONDS,
        }),
      });

      const body = await parseMonoResponse(response);
      const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId.trim() : "";
      const pageUrl = typeof body.pageUrl === "string" ? body.pageUrl.trim() : "";

      if (!response.ok || !invoiceId || !pageUrl) {
        const errText = normalizeErrorText(body.errText);
        const errCode = typeof body.errCode === "string" ? body.errCode : null;

        console.error("Mono invoice creation failed", {
          orderId: input.orderId,
          status: response.status,
          hasInvoiceId: Boolean(invoiceId),
          hasPageUrl: Boolean(pageUrl),
          errCode,
          errText,
        });

        throw new MonoProviderError("Monobank invoice creation failed", {
          httpStatus: response.status,
          errCode,
          errText,
        });
      }

      return {
        provider: "mono",
        providerInvoiceId: invoiceId,
        paymentUrl: pageUrl,
      };
    },
  };
};
