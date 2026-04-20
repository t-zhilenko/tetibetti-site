import type {
  FulfillmentStatus,
  OrderStatus,
  PaymentAttemptStatus,
} from "@/lib/payments/types";

export const NOT_PAYABLE_ORDER_STATUSES = new Set<OrderStatus>([
  "paid",
  "failed",
  "expired",
]);

export const NOT_PAYABLE_PAYMENT_ATTEMPT_STATUSES = new Set<PaymentAttemptStatus>([
  "paid",
  "failed",
  "expired",
]);

export const isFinalOrderStatus = (status: OrderStatus): boolean =>
  status === "paid" ||
  status === "failed" ||
  status === "expired" ||
  status === "manual_review";

export const isPaidOrderStatus = (status: OrderStatus): boolean => status === "paid";

export const isFulfillmentCompleted = (status: FulfillmentStatus): boolean =>
  status === "delivered";
