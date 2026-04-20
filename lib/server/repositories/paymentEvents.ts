import type { PaymentEvent } from "@/lib/payments/types";
import type { D1Database } from "@/lib/server/d1";

type PaymentEventRow = {
  id: string;
  order_id: string | null;
  provider: string;
  event_type: string;
  idempotency_key: string;
  payload_json: string;
  processed_at: string | null;
  created_at: string;
};

export type CreatePaymentEventInput = {
  id: string;
  orderId: string | null;
  provider: string;
  eventType: string;
  idempotencyKey: string;
  payloadJson: string;
};

const mapPaymentEventRow = (row: PaymentEventRow): PaymentEvent => ({
  id: row.id,
  orderId: row.order_id,
  provider: row.provider,
  eventType: row.event_type,
  idempotencyKey: row.idempotency_key,
  payloadJson: row.payload_json,
  processedAt: row.processed_at,
  createdAt: row.created_at,
});

export const findPaymentEventByIdempotencyKey = async (
  db: D1Database,
  idempotencyKey: string,
): Promise<PaymentEvent | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          order_id,
          provider,
          event_type,
          idempotency_key,
          payload_json,
          processed_at,
          created_at
        FROM payment_events
        WHERE idempotency_key = ?
        LIMIT 1
      `,
    )
    .bind(idempotencyKey)
    .first<PaymentEventRow>();

  return row ? mapPaymentEventRow(row) : null;
};

export const createPaymentEvent = async (
  db: D1Database,
  input: CreatePaymentEventInput,
): Promise<{ event: PaymentEvent; inserted: boolean }> => {
  await db
    .prepare(
      `
        INSERT OR IGNORE INTO payment_events (
          id,
          order_id,
          provider,
          event_type,
          idempotency_key,
          payload_json
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      input.id,
      input.orderId,
      input.provider,
      input.eventType,
      input.idempotencyKey,
      input.payloadJson,
    )
    .run();

  const event = await findPaymentEventByIdempotencyKey(db, input.idempotencyKey);
  if (!event) {
    throw new Error("Unable to load payment event after insert/select");
  }

  return {
    event,
    inserted: event.id === input.id,
  };
};

export const markPaymentEventProcessed = async (
  db: D1Database,
  id: string,
): Promise<void> => {
  await db
    .prepare(
      `
        UPDATE payment_events
        SET
          processed_at = COALESCE(processed_at, CURRENT_TIMESTAMP)
        WHERE id = ?
      `,
    )
    .bind(id)
    .run();
};
