import type { DeliveryToken, FulfillmentStatus, OrderStatus } from "@/lib/payments/types";
import type { D1Database } from "@/lib/server/d1";

type DeliveryTokenRow = {
  id: string;
  order_id: string;
  token_hash: string;
  expires_at: string | null;
  revoked_at: string | null;
  used_at: string | null;
  created_at: string;
};

type DeliveryOrderRow = {
  token_id: string;
  token_hash: string;
  token_created_at: string;
  token_expires_at: string | null;
  token_revoked_at: string | null;
  token_used_at: string | null;
  order_id: string;
  order_status: OrderStatus;
  order_fulfillment_status: FulfillmentStatus;
  customer_email: string;
  product_slug: string;
  product_name: string;
  product_target_url: string | null;
};

export type CreateDeliveryTokenInput = {
  id: string;
  orderId: string;
  tokenHash: string;
  expiresAt?: string | null;
};

export type DeliveryTokenOrderAccess = {
  token: DeliveryToken;
  orderId: string;
  orderStatus: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  customerEmail: string;
  productSlug: string;
  productName: string;
  productTargetUrl: string | null;
};

const mapDeliveryTokenRow = (row: DeliveryTokenRow): DeliveryToken => ({
  id: row.id,
  orderId: row.order_id,
  tokenHash: row.token_hash,
  expiresAt: row.expires_at,
  revokedAt: row.revoked_at,
  usedAt: row.used_at,
  createdAt: row.created_at,
});

const mapDeliveryOrderRow = (row: DeliveryOrderRow): DeliveryTokenOrderAccess => ({
  token: {
    id: row.token_id,
    orderId: row.order_id,
    tokenHash: row.token_hash,
    expiresAt: row.token_expires_at,
    revokedAt: row.token_revoked_at,
    usedAt: row.token_used_at,
    createdAt: row.token_created_at,
  },
  orderId: row.order_id,
  orderStatus: row.order_status,
  fulfillmentStatus: row.order_fulfillment_status,
  customerEmail: row.customer_email,
  productSlug: row.product_slug,
  productName: row.product_name,
  productTargetUrl: row.product_target_url,
});

export const findDeliveryTokenById = async (
  db: D1Database,
  id: string,
): Promise<DeliveryToken | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          order_id,
          token_hash,
          expires_at,
          revoked_at,
          used_at,
          created_at
        FROM delivery_tokens
        WHERE id = ?
        LIMIT 1
      `,
    )
    .bind(id)
    .first<DeliveryTokenRow>();

  return row ? mapDeliveryTokenRow(row) : null;
};

export const findLatestActiveDeliveryTokenByOrderId = async (
  db: D1Database,
  orderId: string,
): Promise<DeliveryToken | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          order_id,
          token_hash,
          expires_at,
          revoked_at,
          used_at,
          created_at
        FROM delivery_tokens
        WHERE order_id = ?
          AND revoked_at IS NULL
          AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
    )
    .bind(orderId)
    .first<DeliveryTokenRow>();

  return row ? mapDeliveryTokenRow(row) : null;
};

export const createDeliveryToken = async (
  db: D1Database,
  input: CreateDeliveryTokenInput,
): Promise<DeliveryToken> => {
  await db
    .prepare(
      `
        INSERT INTO delivery_tokens (
          id,
          order_id,
          token_hash,
          expires_at
        )
        VALUES (?, ?, ?, ?)
      `,
    )
    .bind(input.id, input.orderId, input.tokenHash, input.expiresAt ?? null)
    .run();

  const token = await findDeliveryTokenById(db, input.id);
  if (!token) {
    throw new Error(`Unable to load delivery token after insert: ${input.id}`);
  }

  return token;
};

export const touchDeliveryTokenUsedAt = async (
  db: D1Database,
  id: string,
): Promise<void> => {
  await db
    .prepare(
      `
        UPDATE delivery_tokens
        SET
          used_at = COALESCE(used_at, CURRENT_TIMESTAMP)
        WHERE id = ?
      `,
    )
    .bind(id)
    .run();
};

export const findOrderByDeliveryTokenHash = async (
  db: D1Database,
  tokenHash: string,
): Promise<DeliveryTokenOrderAccess | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          dt.id AS token_id,
          dt.token_hash,
          dt.created_at AS token_created_at,
          dt.expires_at AS token_expires_at,
          dt.revoked_at AS token_revoked_at,
          dt.used_at AS token_used_at,
          o.id AS order_id,
          o.status AS order_status,
          o.fulfillment_status AS order_fulfillment_status,
          c.email AS customer_email,
          p.slug AS product_slug,
          p.name AS product_name,
          p.target_url AS product_target_url
        FROM delivery_tokens dt
        INNER JOIN orders o ON o.id = dt.order_id
        INNER JOIN customers c ON c.id = o.customer_id
        INNER JOIN products p ON p.id = o.product_id
        WHERE dt.token_hash = ?
          AND dt.revoked_at IS NULL
          AND (dt.expires_at IS NULL OR dt.expires_at > CURRENT_TIMESTAMP)
        LIMIT 1
      `,
    )
    .bind(tokenHash)
    .first<DeliveryOrderRow>();

  return row ? mapDeliveryOrderRow(row) : null;
};
