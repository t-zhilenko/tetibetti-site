import { getDb } from "@/lib/server/db";
import { MissingPaymentEnvError, getRequiredMonoEnv } from "@/lib/server/env";
import { fulfillPaidProductDelivery } from "@/lib/server/fulfillment/paidProductDelivery";
import { MonoInvoiceStatusError, fetchMonoInvoiceStatus } from "@/lib/server/payments/mono-invoice";
import { mapMonoWebhookOutcome } from "@/lib/server/payments/mono-webhook";
import { isFinalOrderStatus } from "@/lib/payments/status-helpers";
import { findOrderByIdWithCustomerAndProduct } from "@/lib/server/repositories/orders";
import { findLatestPaymentAttemptByOrderId } from "@/lib/server/repositories/paymentAttempts";
import { isUuid } from "@/lib/server/security";
import {
  markOrderAsExpired,
  markOrderAsFailed,
  markOrderAsPaid,
  markOrderAsProcessing,
} from "@/lib/server/repositories/orders";
import { updatePaymentAttemptStatus } from "@/lib/server/repositories/paymentAttempts";

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export async function GET(request: Request) {
  const url = new URL(request.url);
  const orderIdRaw = url.searchParams.get("orderId") ?? "";
  const orderId = orderIdRaw.trim();

  if (!orderId) {
    return jsonResponse({ ok: false, code: "MISSING_ORDER_ID", message: "Missing orderId" }, 400);
  }

  if (!isUuid(orderId)) {
    return jsonResponse({ ok: false, code: "INVALID_ORDER_ID", message: "Invalid orderId" }, 400);
  }

  try {
    const db = await getDb();
    let order = await findOrderByIdWithCustomerAndProduct(db, orderId);
    if (!order) {
      return jsonResponse({ ok: false, code: "ORDER_NOT_FOUND", message: "Order not found" }, 404);
    }

    let paymentAttempt = await findLatestPaymentAttemptByOrderId(db, order.id);

    const canSyncMonoStatus =
      paymentAttempt?.provider === "mono" &&
      typeof paymentAttempt.providerOrderId === "string" &&
      Boolean(paymentAttempt.providerOrderId.trim()) &&
      !isFinalOrderStatus(order.status);

    if (canSyncMonoStatus && paymentAttempt?.providerOrderId) {
      try {
        const monoEnv = await getRequiredMonoEnv();
        const invoice = await fetchMonoInvoiceStatus(
          monoEnv.monoApiBaseUrl,
          monoEnv.monoToken,
          paymentAttempt.providerOrderId,
        );
        const outcome = mapMonoWebhookOutcome(invoice.status);
        const previousOrderStatus = order.status;

        console.info("Order-status Mono sync received", {
          orderId: order.id,
          invoiceId: invoice.invoiceId,
          invoiceStatus: invoice.status,
          localStatus: previousOrderStatus,
        });

        if (outcome === "paid") {
          if (order.status !== "paid") {
            await markOrderAsPaid(db, order.id);
            order = {
              ...order,
              status: "paid",
              fulfillmentStatus: "ready_for_delivery",
              paidAt: order.paidAt ?? new Date().toISOString(),
            };
          }

          if (paymentAttempt.status !== "paid") {
            paymentAttempt = await updatePaymentAttemptStatus(db, {
              id: paymentAttempt.id,
              status: "paid",
              providerOrderId: invoice.invoiceId,
              providerPaymentId: invoice.invoiceId,
              rawStatus: invoice.status,
              payloadJson: JSON.stringify({
                source: "order-status-sync",
                invoiceStatus: invoice,
              }),
            });
          }

          if (previousOrderStatus !== "paid" || order.fulfillmentStatus !== "delivered") {
            const deliveryResult = await fulfillPaidProductDelivery(db, {
              orderId: order.id,
              allowResendEmail: false,
              forceNewToken: false,
            });

            console.info("Order-status Mono sync delivery processed", {
              orderId: order.id,
              invoiceId: invoice.invoiceId,
              deliveryStatus: deliveryResult.status,
            });
          } else {
            console.info("Order-status Mono sync delivery skipped", {
              orderId: order.id,
              invoiceId: invoice.invoiceId,
              reason: "already_delivered",
            });
          }
        } else if (outcome === "failed" && order.status !== "paid") {
          await markOrderAsFailed(db, order.id);
          order = {
            ...order,
            status: "failed",
            fulfillmentStatus: "pending",
          };

          if (paymentAttempt.status !== "failed") {
            paymentAttempt = await updatePaymentAttemptStatus(db, {
              id: paymentAttempt.id,
              status: "failed",
              providerOrderId: invoice.invoiceId,
              providerPaymentId: invoice.invoiceId,
              rawStatus: invoice.status,
              payloadJson: JSON.stringify({
                source: "order-status-sync",
                invoiceStatus: invoice,
              }),
            });
          }
        } else if (outcome === "expired" && order.status !== "paid") {
          await markOrderAsExpired(db, order.id);
          order = {
            ...order,
            status: "expired",
            fulfillmentStatus: "pending",
          };

          if (paymentAttempt.status !== "expired") {
            paymentAttempt = await updatePaymentAttemptStatus(db, {
              id: paymentAttempt.id,
              status: "expired",
              providerOrderId: invoice.invoiceId,
              providerPaymentId: invoice.invoiceId,
              rawStatus: invoice.status,
              payloadJson: JSON.stringify({
                source: "order-status-sync",
                invoiceStatus: invoice,
              }),
            });
          }
        } else if (!isFinalOrderStatus(order.status)) {
          await markOrderAsProcessing(db, order.id);
          order = {
            ...order,
            status: "processing",
            fulfillmentStatus: "pending",
          };

          if (paymentAttempt.status !== "pending") {
            paymentAttempt = await updatePaymentAttemptStatus(db, {
              id: paymentAttempt.id,
              status: "pending",
              providerOrderId: invoice.invoiceId,
              providerPaymentId: invoice.invoiceId,
              rawStatus: invoice.status,
              payloadJson: JSON.stringify({
                source: "order-status-sync",
                invoiceStatus: invoice,
              }),
            });
          }
        }

        if (previousOrderStatus !== order.status) {
          console.info("Order-status Mono sync transition", {
            orderId: order.id,
            invoiceId: invoice.invoiceId,
            from: previousOrderStatus,
            to: order.status,
          });
        }
      } catch (error) {
        if (error instanceof MissingPaymentEnvError) {
          console.error("Order-status Mono sync skipped due to missing env", {
            orderId: order.id,
            missingKeys: error.missingKeys,
          });
        } else if (error instanceof MonoInvoiceStatusError) {
          console.error("Order-status Mono sync invoice API error", {
            orderId: order.id,
            invoiceId: paymentAttempt.providerOrderId,
            message: error.message,
            httpStatus:
              typeof error.details?.httpStatus === "number" ? error.details.httpStatus : undefined,
            errCode:
              typeof error.details?.errCode === "string" ? error.details.errCode : undefined,
          });
        } else {
          console.error("Order-status Mono sync failed", {
            orderId: order.id,
            invoiceId: paymentAttempt.providerOrderId,
            message: error instanceof Error ? error.message : "Unknown sync error",
          });
        }
      }
    }

    return jsonResponse({
      ok: true,
      orderId: order.id,
      status: order.status,
      productSlug: order.productSlug,
      paymentProvider: paymentAttempt?.provider ?? order.provider,
      providerInvoiceId: paymentAttempt?.providerOrderId ?? null,
      canResendAccess: order.status === "paid",
    });
  } catch (error) {
    console.error("Order status lookup failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse(
      { ok: false, code: "ORDER_STATUS_FAILED", message: "Unable to load order status" },
      500,
    );
  }
}
