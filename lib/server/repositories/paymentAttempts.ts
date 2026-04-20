import type { PaymentAttempt, PaymentAttemptStatus } from "@/lib/payments/types";
import type { D1Database } from "@/lib/server/d1";

type PaymentAttemptRow = {
  id: string;
  order_id: string;
  provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  status: PaymentAttemptStatus;
  raw_status: string | null;
  amount_minor: number;
  currency: string;
  payload_json: string | null;
  created_at: string;
  updated_at: string;
};

export type CreatePaymentAttemptInput = {
  id: string;
  orderId: string;
  provider: string;
  status: PaymentAttemptStatus;
  amountMinor: number;
  currency: string;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  rawStatus?: string | null;
  payloadJson?: string | null;
};

const mapPaymentAttemptRow = (row: PaymentAttemptRow): PaymentAttempt => ({
  id: row.id,
  orderId: row.order_id,
  provider: row.provider,
  providerOrderId: row.provider_order_id,
  providerPaymentId: row.provider_payment_id,
  status: row.status,
  rawStatus: row.raw_status,
  amountMinor: row.amount_minor,
  currency: row.currency,
  payloadJson: row.payload_json,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findPaymentAttemptById = async (
  db: D1Database,
  id: string,
): Promise<PaymentAttempt | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          order_id,
          provider,
          provider_order_id,
          provider_payment_id,
          status,
          raw_status,
          amount_minor,
          currency,
          payload_json,
          created_at,
          updated_at
        FROM payment_attempts
        WHERE id = ?
        LIMIT 1
      `,
    )
    .bind(id)
    .first<PaymentAttemptRow>();

  return row ? mapPaymentAttemptRow(row) : null;
};

export const findLatestPaymentAttemptByProviderOrderId = async (
  db: D1Database,
  providerOrderId: string,
): Promise<PaymentAttempt | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          order_id,
          provider,
          provider_order_id,
          provider_payment_id,
          status,
          raw_status,
          amount_minor,
          currency,
          payload_json,
          created_at,
          updated_at
        FROM payment_attempts
        WHERE provider_order_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
    )
    .bind(providerOrderId)
    .first<PaymentAttemptRow>();

  return row ? mapPaymentAttemptRow(row) : null;
};

export const findLatestPaymentAttemptByOrderId = async (
  db: D1Database,
  orderId: string,
): Promise<PaymentAttempt | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          order_id,
          provider,
          provider_order_id,
          provider_payment_id,
          status,
          raw_status,
          amount_minor,
          currency,
          payload_json,
          created_at,
          updated_at
        FROM payment_attempts
        WHERE order_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
    )
    .bind(orderId)
    .first<PaymentAttemptRow>();

  return row ? mapPaymentAttemptRow(row) : null;
};

export type UpdatePaymentAttemptStatusInput = {
  id: string;
  status?: PaymentAttemptStatus;
  providerOrderId?: string | null;
  providerPaymentId?: string | null;
  rawStatus?: string | null;
  payloadJson?: string | null;
};

export const updatePaymentAttemptStatus = async (
  db: D1Database,
  input: UpdatePaymentAttemptStatusInput,
): Promise<PaymentAttempt> => {
  await db
    .prepare(
      `
        UPDATE payment_attempts
        SET
          status = COALESCE(?, status),
          provider_order_id = COALESCE(?, provider_order_id),
          provider_payment_id = COALESCE(?, provider_payment_id),
          raw_status = COALESCE(?, raw_status),
          payload_json = COALESCE(?, payload_json),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    )
    .bind(
      input.status ?? null,
      input.providerOrderId ?? null,
      input.providerPaymentId ?? null,
      input.rawStatus ?? null,
      input.payloadJson ?? null,
      input.id,
    )
    .run();

  const paymentAttempt = await findPaymentAttemptById(db, input.id);
  if (!paymentAttempt) {
    throw new Error(`Unable to load payment attempt after update: ${input.id}`);
  }

  return paymentAttempt;
};

export type UpdatePaymentAttemptCheckoutInput = {
  id: string;
  status?: PaymentAttemptStatus;
  providerOrderId?: string | null;
  payloadJson?: string | null;
  rawStatus?: string | null;
};

export const updatePaymentAttemptCheckout = async (
  db: D1Database,
  input: UpdatePaymentAttemptCheckoutInput,
): Promise<PaymentAttempt> => {
  return updatePaymentAttemptStatus(db, {
    id: input.id,
    status: input.status,
    providerOrderId: input.providerOrderId,
    payloadJson: input.payloadJson,
    rawStatus: input.rawStatus,
  });
};

export const createPaymentAttempt = async (
  db: D1Database,
  input: CreatePaymentAttemptInput,
): Promise<PaymentAttempt> => {
  await db
    .prepare(
      `
        INSERT INTO payment_attempts (
          id,
          order_id,
          provider,
          provider_order_id,
          provider_payment_id,
          status,
          raw_status,
          amount_minor,
          currency,
          payload_json
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      input.id,
      input.orderId,
      input.provider,
      input.providerOrderId ?? null,
      input.providerPaymentId ?? null,
      input.status,
      input.rawStatus ?? null,
      input.amountMinor,
      input.currency,
      input.payloadJson ?? null,
    )
    .run();

  const paymentAttempt = await findPaymentAttemptById(db, input.id);
  if (!paymentAttempt) {
    throw new Error(`Unable to load payment attempt after insert: ${input.id}`);
  }

  return paymentAttempt;
};
