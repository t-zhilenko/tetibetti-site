import type { FulfillmentStatus, Order, OrderStatus } from "@/lib/payments/types";
import type { D1Database } from "@/lib/server/d1";

type OrderRow = {
  id: string;
  customer_id: number;
  product_id: number;
  amount_minor: number;
  currency: string;
  status: OrderStatus;
  fulfillment_status: FulfillmentStatus;
  provider: string | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
};

type OrderWithRelationsRow = OrderRow & {
  customer_email: string;
  product_slug: string;
  product_name: string;
  product_delivery_type: string;
  product_target_url: string | null;
};

export type OrderWithCustomerAndProduct = Order & {
  customerEmail: string;
  productSlug: string;
  productName: string;
  productDeliveryType: string;
  productTargetUrl: string | null;
};

export type PaidOrderLookupItem = {
  orderId: string;
  paidAt: string;
  amountMinor: number;
  currency: string;
  fulfillmentStatus: FulfillmentStatus;
  productName: string;
};

export type RecentOrderLookupItem = {
  orderId: string;
  productName: string;
  productSlug: string;
  paymentStatus: OrderStatus;
  paidAt: string | null;
  fulfillmentStatus: FulfillmentStatus;
};

export type CreateOrderInput = {
  id: string;
  customerId: number;
  productId: number;
  amountMinor: number;
  currency: string;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  provider: string | null;
};

const mapOrderRow = (row: OrderRow): Order => ({
  id: row.id,
  customerId: row.customer_id,
  productId: row.product_id,
  amountMinor: row.amount_minor,
  currency: row.currency,
  status: row.status,
  fulfillmentStatus: row.fulfillment_status,
  provider: row.provider,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  paidAt: row.paid_at,
});

const mapOrderWithRelationsRow = (row: OrderWithRelationsRow): OrderWithCustomerAndProduct => ({
  ...mapOrderRow(row),
  customerEmail: row.customer_email,
  productSlug: row.product_slug,
  productName: row.product_name,
  productDeliveryType: row.product_delivery_type,
  productTargetUrl: row.product_target_url,
});

const mustFindOrderById = async (db: D1Database, id: string): Promise<Order> => {
  const order = await findOrderById(db, id);
  if (!order) {
    throw new Error(`Unable to load order after update: ${id}`);
  }
  return order;
};

export const findOrderById = async (db: D1Database, id: string): Promise<Order | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          customer_id,
          product_id,
          amount_minor,
          currency,
          status,
          fulfillment_status,
          provider,
          created_at,
          updated_at,
          paid_at
        FROM orders
        WHERE id = ?
        LIMIT 1
      `,
    )
    .bind(id)
    .first<OrderRow>();

  return row ? mapOrderRow(row) : null;
};

export const createOrder = async (db: D1Database, input: CreateOrderInput): Promise<Order> => {
  await db
    .prepare(
      `
        INSERT INTO orders (
          id,
          customer_id,
          product_id,
          amount_minor,
          currency,
          status,
          fulfillment_status,
          provider
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
    )
    .bind(
      input.id,
      input.customerId,
      input.productId,
      input.amountMinor,
      input.currency,
      input.status,
      input.fulfillmentStatus,
      input.provider,
    )
    .run();

  const order = await findOrderById(db, input.id);
  if (!order) {
    throw new Error(`Unable to load order after insert: ${input.id}`);
  }

  return order;
};

export const findOrderByIdWithCustomerAndProduct = async (
  db: D1Database,
  id: string,
): Promise<OrderWithCustomerAndProduct | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          o.id,
          o.customer_id,
          o.product_id,
          o.amount_minor,
          o.currency,
          o.status,
          o.fulfillment_status,
          o.provider,
          o.created_at,
          o.updated_at,
          o.paid_at,
          c.email AS customer_email,
          p.slug AS product_slug,
          p.name AS product_name,
          p.delivery_type AS product_delivery_type,
          p.target_url AS product_target_url
        FROM orders o
        INNER JOIN customers c ON c.id = o.customer_id
        INNER JOIN products p ON p.id = o.product_id
        WHERE o.id = ?
        LIMIT 1
      `,
    )
    .bind(id)
    .first<OrderWithRelationsRow>();

  return row ? mapOrderWithRelationsRow(row) : null;
};

export const findPaidOrdersByEmail = async (
  db: D1Database,
  email: string,
  limit = 10,
): Promise<PaidOrderLookupItem[]> => {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.trunc(limit), 50) : 10;
  const result = await db
    .prepare(
      `
        SELECT
          o.id AS order_id,
          o.paid_at,
          o.amount_minor,
          o.currency,
          o.fulfillment_status,
          p.name AS product_name
        FROM orders o
        INNER JOIN customers c ON c.id = o.customer_id
        INNER JOIN products p ON p.id = o.product_id
        WHERE c.email = ?
          AND o.status = 'paid'
          AND o.paid_at IS NOT NULL
        ORDER BY o.paid_at DESC, o.updated_at DESC
        LIMIT ?
      `,
    )
    .bind(email, safeLimit)
    .all<{
      order_id: string;
      paid_at: string;
      amount_minor: number;
      currency: string;
      fulfillment_status: FulfillmentStatus;
      product_name: string;
    }>();

  return (result.results ?? []).map((row) => ({
    orderId: row.order_id,
    paidAt: row.paid_at,
    amountMinor: row.amount_minor,
    currency: row.currency,
    fulfillmentStatus: row.fulfillment_status,
    productName: row.product_name,
  }));
};

export const findRecentOrdersByEmail = async (
  db: D1Database,
  email: string,
  limit = 10,
): Promise<RecentOrderLookupItem[]> => {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(Math.trunc(limit), 50) : 10;
  const result = await db
    .prepare(
      `
        SELECT
          o.id AS order_id,
          o.status,
          o.paid_at,
          o.fulfillment_status,
          p.name AS product_name,
          p.slug AS product_slug
        FROM orders o
        INNER JOIN customers c ON c.id = o.customer_id
        INNER JOIN products p ON p.id = o.product_id
        WHERE c.email = ?
        ORDER BY o.updated_at DESC, o.created_at DESC
        LIMIT ?
      `,
    )
    .bind(email, safeLimit)
    .all<{
      order_id: string;
      status: OrderStatus;
      paid_at: string | null;
      fulfillment_status: FulfillmentStatus;
      product_name: string;
      product_slug: string;
    }>();

  return (result.results ?? []).map((row) => ({
    orderId: row.order_id,
    productName: row.product_name,
    productSlug: row.product_slug,
    paymentStatus: row.status,
    paidAt: row.paid_at,
    fulfillmentStatus: row.fulfillment_status,
  }));
};

type UpdateOrderStatusInput = {
  id: string;
  status?: OrderStatus;
  fulfillmentStatus?: FulfillmentStatus;
  paidAtCurrentTimestamp?: boolean;
};

export const updateOrderStatus = async (
  db: D1Database,
  input: UpdateOrderStatusInput,
): Promise<Order> => {
  const setPaidAtExpression = input.paidAtCurrentTimestamp
    ? "paid_at = COALESCE(paid_at, CURRENT_TIMESTAMP),"
    : "";

  await db
    .prepare(
      `
        UPDATE orders
        SET
          status = COALESCE(?, status),
          fulfillment_status = COALESCE(?, fulfillment_status),
          ${setPaidAtExpression}
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
    )
    .bind(input.status ?? null, input.fulfillmentStatus ?? null, input.id)
    .run();

  return mustFindOrderById(db, input.id);
};

export const markOrderAsProcessing = async (db: D1Database, id: string): Promise<Order> =>
  updateOrderStatus(db, {
    id,
    status: "processing",
    fulfillmentStatus: "pending",
  });

export const markOrderAsPaid = async (db: D1Database, id: string): Promise<Order> =>
  updateOrderStatus(db, {
    id,
    status: "paid",
    fulfillmentStatus: "ready_for_delivery",
    paidAtCurrentTimestamp: true,
  });

export const markOrderAsFailed = async (db: D1Database, id: string): Promise<Order> =>
  updateOrderStatus(db, {
    id,
    status: "failed",
    fulfillmentStatus: "pending",
  });

export const markOrderAsExpired = async (db: D1Database, id: string): Promise<Order> =>
  updateOrderStatus(db, {
    id,
    status: "expired",
    fulfillmentStatus: "pending",
  });

export const markOrderAsManualReview = async (db: D1Database, id: string): Promise<Order> =>
  updateOrderStatus(db, {
    id,
    status: "manual_review",
  });

export const markOrderFulfillmentDelivered = async (
  db: D1Database,
  id: string,
): Promise<Order> =>
  updateOrderStatus(db, {
    id,
    fulfillmentStatus: "delivered",
  });

export const markOrderFulfillmentDeliveryFailed = async (
  db: D1Database,
  id: string,
): Promise<Order> =>
  updateOrderStatus(db, {
    id,
    fulfillmentStatus: "delivery_failed",
  });
