export const ORDER_STATUSES = [
  "initiated",
  "processing",
  "paid",
  "failed",
  "expired",
  "manual_review",
] as const;

export const FULFILLMENT_STATUSES = [
  "pending",
  "ready_for_delivery",
  "delivered",
  "delivery_failed",
] as const;

export const PAYMENT_ATTEMPT_STATUSES = [
  "created",
  "pending",
  "paid",
  "failed",
  "expired",
] as const;

export const EMAIL_DELIVERY_STATUSES = ["pending", "sent", "failed"] as const;

export const PRODUCT_STATUSES = ["active", "coming_soon", "archived"] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number];
export type PaymentAttemptStatus = (typeof PAYMENT_ATTEMPT_STATUSES)[number];
export type EmailDeliveryStatus = (typeof EMAIL_DELIVERY_STATUSES)[number];
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export type Product = {
  id: number;
  slug: string;
  name: string;
  priceMinor: number;
  currency: string;
  isActive: boolean;
  status: ProductStatus;
  deliveryType: string;
  targetUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: string;
  customerId: number;
  productId: number;
  amountMinor: number;
  currency: string;
  status: OrderStatus;
  fulfillmentStatus: FulfillmentStatus;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
};

export type PaymentAttempt = {
  id: string;
  orderId: string;
  provider: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  status: PaymentAttemptStatus;
  rawStatus: string | null;
  amountMinor: number;
  currency: string;
  payloadJson: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeliveryToken = {
  id: string;
  orderId: string;
  tokenHash: string;
  expiresAt: string | null;
  revokedAt: string | null;
  usedAt: string | null;
  createdAt: string;
};

export type EmailDelivery = {
  id: string;
  orderId: string;
  templateType: string;
  provider: string;
  providerMessageId: string | null;
  status: EmailDeliveryStatus;
  attemptsCount: number;
  lastError: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentEvent = {
  id: string;
  orderId: string | null;
  provider: string;
  eventType: string;
  idempotencyKey: string;
  payloadJson: string;
  processedAt: string | null;
  createdAt: string;
};
