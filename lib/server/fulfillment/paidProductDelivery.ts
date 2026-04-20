import { randomUUID } from "node:crypto";
import { getRequiredAppBaseUrl } from "@/lib/server/env";
import {
  PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
  sendPaidProductDeliveryEmail,
} from "@/lib/server/delivery/brevo";
import {
  createDeliveryToken,
  findLatestActiveDeliveryTokenByOrderId,
} from "@/lib/server/repositories/deliveryTokens";
import {
  createEmailDelivery,
  updateEmailDeliveryStatus,
} from "@/lib/server/repositories/emailDeliveries";
import {
  findOrderByIdWithCustomerAndProduct,
  markOrderFulfillmentDelivered,
  markOrderFulfillmentDeliveryFailed,
} from "@/lib/server/repositories/orders";
import { sha256Hex } from "@/lib/server/security";
import { getSupportEmail } from "@/lib/server/support";
import type { D1Database } from "@/lib/server/d1";

export type FulfillPaidProductDeliveryInput = {
  orderId: string;
  allowResendEmail?: boolean;
  forceNewToken?: boolean;
};

export type FulfillPaidProductDeliveryResult =
  | {
      status: "skipped_unpaid";
    }
  | {
      status: "skipped_already_delivered";
      tokenId: string;
    }
  | {
      status: "delivered";
      tokenId: string;
      emailDeliveryId: string;
      reusedToken: boolean;
    }
  | {
      status: "delivery_failed";
      tokenId: string;
      emailDeliveryId: string;
      reusedToken: boolean;
    };

const DELIVERY_TEMPLATE_TYPE = "paid_product_delivery";
const DELIVERY_PROVIDER = "brevo";

const buildAccessUrl = (appBaseUrl: string, token: string): string =>
  new URL(`/access/${encodeURIComponent(token)}`, appBaseUrl).toString();

const shortenError = (value: unknown): string => {
  const text = value instanceof Error ? value.message : "Unknown delivery error";
  return text.slice(0, 500);
};

const maskEmail = (value: string): string => {
  const normalized = value.trim().toLowerCase();
  const [localPart, domainPart] = normalized.split("@");
  if (!localPart || !domainPart) {
    return "***";
  }

  const visiblePrefix = localPart.length <= 2 ? localPart.slice(0, 1) : localPart.slice(0, 2);
  return `${visiblePrefix}***@${domainPart}`;
};

export const fulfillPaidProductDelivery = async (
  db: D1Database,
  input: FulfillPaidProductDeliveryInput,
): Promise<FulfillPaidProductDeliveryResult> => {
  const order = await findOrderByIdWithCustomerAndProduct(db, input.orderId);
  if (!order) {
    throw new Error(`Order not found for fulfillment: ${input.orderId}`);
  }

  if (order.status !== "paid") {
    return { status: "skipped_unpaid" };
  }

  const existingToken = await findLatestActiveDeliveryTokenByOrderId(db, order.id);
  if (!input.allowResendEmail && order.fulfillmentStatus === "delivered" && existingToken) {
    return {
      status: "skipped_already_delivered",
      tokenId: existingToken.id,
    };
  }

  const shouldReuseToken = Boolean(existingToken) && !input.forceNewToken;
  const tokenId = shouldReuseToken && existingToken ? existingToken.id : randomUUID();

  if (!shouldReuseToken) {
    await createDeliveryToken(db, {
      id: tokenId,
      orderId: order.id,
      tokenHash: sha256Hex(tokenId),
    });
  }

  const emailDelivery = await createEmailDelivery(db, {
    id: randomUUID(),
    orderId: order.id,
    templateType: DELIVERY_TEMPLATE_TYPE,
    provider: DELIVERY_PROVIDER,
    status: "pending",
    attemptsCount: 0,
  });

  const supportEmail = getSupportEmail();
  const maskedCustomerEmail = maskEmail(order.customerEmail);
  let accessUrl = "";

  try {
    const appBaseUrl = await getRequiredAppBaseUrl();
    accessUrl = buildAccessUrl(appBaseUrl, tokenId);
  } catch (error) {
    const reason = shortenError(error);

    await updateEmailDeliveryStatus(db, {
      id: emailDelivery.id,
      status: "failed",
      providerMessageId: null,
      lastError: reason,
      attemptsCountIncrement: 1,
      markSentNow: false,
      markDeliveredNow: false,
    });

    await markOrderFulfillmentDeliveryFailed(db, order.id);

    console.error("Paid delivery: access URL build failed", {
      orderId: order.id,
      customerEmail: maskedCustomerEmail,
      emailDeliveryId: emailDelivery.id,
      reason,
    });

    return {
      status: "delivery_failed",
      tokenId,
      emailDeliveryId: emailDelivery.id,
      reusedToken: shouldReuseToken,
    };
  }

  console.info("Paid delivery: sending access email", {
    orderId: order.id,
    customerEmail: maskedCustomerEmail,
    templateId: PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
    hasAccessUrl: Boolean(accessUrl),
    accessRoute: "/access/[token]",
    reusedToken: shouldReuseToken,
  });

  const sendResult = await sendPaidProductDeliveryEmail({
    orderId: order.id,
    customerEmail: order.customerEmail,
    accessUrl,
    productName: order.productName,
    supportEmail,
  });

  if (sendResult.ok) {
    await updateEmailDeliveryStatus(db, {
      id: emailDelivery.id,
      status: "sent",
      providerMessageId: sendResult.providerMessageId,
      lastError: null,
      attemptsCountIncrement: 1,
      markSentNow: true,
      markDeliveredNow: true,
    });

    await markOrderFulfillmentDelivered(db, order.id);

    console.info("Paid delivery: email sent", {
      orderId: order.id,
      customerEmail: maskedCustomerEmail,
      templateId: sendResult.templateId,
      providerMessageId: sendResult.providerMessageId,
      emailDeliveryId: emailDelivery.id,
    });

    return {
      status: "delivered",
      tokenId,
      emailDeliveryId: emailDelivery.id,
      reusedToken: shouldReuseToken,
    };
  }

  await updateEmailDeliveryStatus(db, {
    id: emailDelivery.id,
    status: "failed",
    providerMessageId: sendResult.providerMessageId,
    lastError: sendResult.error,
    attemptsCountIncrement: 1,
    markSentNow: false,
    markDeliveredNow: false,
  });

  await markOrderFulfillmentDeliveryFailed(db, order.id);

  console.error("Paid delivery: email send failed", {
    orderId: order.id,
    customerEmail: maskedCustomerEmail,
    templateId: sendResult.templateId,
    providerMessageId: sendResult.providerMessageId,
    emailDeliveryId: emailDelivery.id,
    reason: shortenError(sendResult.error),
  });

  return {
    status: "delivery_failed",
    tokenId,
    emailDeliveryId: emailDelivery.id,
    reusedToken: shouldReuseToken,
  };
};
