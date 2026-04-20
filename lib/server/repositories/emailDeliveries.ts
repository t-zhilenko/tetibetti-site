import type { EmailDelivery, EmailDeliveryStatus } from "@/lib/payments/types";
import type { D1Database } from "@/lib/server/d1";

type EmailDeliveryRow = {
  id: string;
  order_id: string;
  template_type: string;
  provider: string;
  provider_message_id: string | null;
  status: EmailDeliveryStatus;
  attempts_count: number;
  last_error: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateEmailDeliveryInput = {
  id: string;
  orderId: string;
  templateType: string;
  provider: string;
  status: EmailDeliveryStatus;
  attemptsCount?: number;
  providerMessageId?: string | null;
  lastError?: string | null;
};

type UpdateEmailDeliveryStatusInput = {
  id: string;
  status: EmailDeliveryStatus;
  providerMessageId?: string | null;
  lastError?: string | null;
  attemptsCountIncrement?: number;
  markSentNow?: boolean;
  markDeliveredNow?: boolean;
};

const mapEmailDeliveryRow = (row: EmailDeliveryRow): EmailDelivery => ({
  id: row.id,
  orderId: row.order_id,
  templateType: row.template_type,
  provider: row.provider,
  providerMessageId: row.provider_message_id,
  status: row.status,
  attemptsCount: row.attempts_count,
  lastError: row.last_error,
  sentAt: row.sent_at,
  deliveredAt: row.delivered_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const findEmailDeliveryById = async (
  db: D1Database,
  id: string,
): Promise<EmailDelivery | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          order_id,
          template_type,
          provider,
          provider_message_id,
          status,
          attempts_count,
          last_error,
          sent_at,
          delivered_at,
          created_at,
          updated_at
        FROM email_deliveries
        WHERE id = ?
        LIMIT 1
      `,
    )
    .bind(id)
    .first<EmailDeliveryRow>();

  return row ? mapEmailDeliveryRow(row) : null;
};

export const findLatestEmailDeliveryByOrderId = async (
  db: D1Database,
  orderId: string,
  templateType?: string,
): Promise<EmailDelivery | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          order_id,
          template_type,
          provider,
          provider_message_id,
          status,
          attempts_count,
          last_error,
          sent_at,
          delivered_at,
          created_at,
          updated_at
        FROM email_deliveries
        WHERE order_id = ?
          AND (? IS NULL OR template_type = ?)
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
    )
    .bind(orderId, templateType ?? null, templateType ?? null)
    .first<EmailDeliveryRow>();

  return row ? mapEmailDeliveryRow(row) : null;
};

export const createEmailDelivery = async (
  db: D1Database,
  input: CreateEmailDeliveryInput,
): Promise<EmailDelivery> => {
  await db
    .prepare(
      `
        INSERT INTO email_deliveries (
          id,
          order_id,
          template_type,
          provider,
          provider_message_id,
          status,
          attempts_count,
          last_error
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      input.id,
      input.orderId,
      input.templateType,
      input.provider,
      input.providerMessageId ?? null,
      input.status,
      input.attemptsCount ?? 0,
      input.lastError ?? null,
    )
    .run();

  const record = await findEmailDeliveryById(db, input.id);
  if (!record) {
    throw new Error(`Unable to load email delivery after insert: ${input.id}`);
  }

  return record;
};

export const updateEmailDeliveryStatus = async (
  db: D1Database,
  input: UpdateEmailDeliveryStatusInput,
): Promise<EmailDelivery> => {
  await db
    .prepare(
      `
        UPDATE email_deliveries
        SET
          status = ?,
          provider_message_id = COALESCE(?, provider_message_id),
          last_error = ?,
          attempts_count = attempts_count + ?,
          sent_at = CASE WHEN ? = 1 THEN COALESCE(sent_at, CURRENT_TIMESTAMP) ELSE sent_at END,
          delivered_at = CASE
            WHEN ? = 1 THEN COALESCE(delivered_at, CURRENT_TIMESTAMP)
            ELSE delivered_at
          END,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    )
    .bind(
      input.status,
      input.providerMessageId ?? null,
      input.lastError ?? null,
      input.attemptsCountIncrement ?? 0,
      input.markSentNow ? 1 : 0,
      input.markDeliveredNow ? 1 : 0,
      input.id,
    )
    .run();

  const record = await findEmailDeliveryById(db, input.id);
  if (!record) {
    throw new Error(`Unable to load email delivery after update: ${input.id}`);
  }

  return record;
};
