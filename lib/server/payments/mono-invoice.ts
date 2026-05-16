import { normalizeMonoInvoiceStatus, type MonoInvoiceStatus } from "@/lib/server/payments/mono-webhook";

export type MonoInvoiceStatusResponse = {
  invoiceId: string;
  status: MonoInvoiceStatus;
  amount: number | null;
  ccy: number | null;
  modifiedDate: string | null;
  reference: string | null;
  errCode: string | null;
  failureReason: string | null;
};

type MonoRawInvoiceStatusResponse = {
  invoiceId?: unknown;
  status?: unknown;
  amount?: unknown;
  ccy?: unknown;
  modifiedDate?: unknown;
  reference?: unknown;
  errCode?: unknown;
  failureReason?: unknown;
};

const MONO_INVOICE_STATUS_PATH = "/api/merchant/invoice/status";

const parseInteger = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed || null;
};

export class MonoInvoiceStatusError extends Error {
  readonly details?: Record<string, unknown>;

  constructor(message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = "MonoInvoiceStatusError";
    this.details = details;
  }
}

export const fetchMonoInvoiceStatus = async (
  monoApiBaseUrl: string,
  monoToken: string,
  invoiceId: string,
): Promise<MonoInvoiceStatusResponse> => {
  const endpoint = new URL(MONO_INVOICE_STATUS_PATH, monoApiBaseUrl);
  endpoint.searchParams.set("invoiceId", invoiceId);

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    headers: {
      "x-token": monoToken,
      accept: "application/json",
    },
  });

  let payload: MonoRawInvoiceStatusResponse = {};
  try {
    payload = (await response.json()) as MonoRawInvoiceStatusResponse;
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new MonoInvoiceStatusError(`Monobank invoice status failed with HTTP ${response.status}`, {
      invoiceId,
      httpStatus: response.status,
      errCode: parseString(payload.errCode),
      failureReason: parseString(payload.failureReason),
    });
  }

  const resolvedInvoiceId = parseString(payload.invoiceId) ?? invoiceId;
  return {
    invoiceId: resolvedInvoiceId,
    status: normalizeMonoInvoiceStatus(payload.status),
    amount: parseInteger(payload.amount),
    ccy: parseInteger(payload.ccy),
    modifiedDate: parseString(payload.modifiedDate),
    reference: parseString(payload.reference),
    errCode: parseString(payload.errCode),
    failureReason: parseString(payload.failureReason),
  };
};
