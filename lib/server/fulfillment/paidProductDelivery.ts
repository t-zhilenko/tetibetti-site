import { randomUUID } from "node:crypto";
import { getRequiredAppBaseUrl } from "@/lib/server/env";
import {
  DEFAULT_PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
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

const classifyDeliveryFailureReason = (value: unknown): string => {
  const message = shortenError(value).toLowerCase();

  if (message.includes("missing brevo paid-delivery configuration")) {
    return "missing_brevo_config";
  }
  if (message.includes("app_base_url")) {
    return "missing_or_invalid_app_base_url";
  }
  if (message.includes("smtp error: 4")) {
    return "brevo_api_rejected_payload";
  }
  if (message.includes("smtp error: 5")) {
    return "brevo_provider_error";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "brevo_network_error";
  }
  return "delivery_failed_unknown_reason";
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
  console.info("Paid delivery: start", {
    orderId: input.orderId,
    allowResendEmail: Boolean(input.allowResendEmail),
    forceNewToken: Boolean(input.forceNewToken),
  });

  const order = await findOrderByIdWithCustomerAndProduct(db, input.orderId);
  if (!order) {
    console.error("Paid delivery: order not found", {
      orderId: input.orderId,
    });
    throw new Error(`Order not found for fulfillment: ${input.orderId}`);
  }

  console.info("Paid delivery: order loaded", {
    orderId: order.id,
    status: order.status,
    fulfillmentStatusBefore: order.fulfillmentStatus,
    hasCustomerEmail: Boolean(order.customerEmail),
    hasProductTargetUrl: Boolean(order.productTargetUrl),
  });

  if (order.status !== "paid") {
    console.info("Paid delivery: skipped unpaid order", {
      orderId: order.id,
      status: order.status,
    });
    return { status: "skipped_unpaid" };
  }

  const existingToken = await findLatestActiveDeliveryTokenByOrderId(db, order.id);
  if (!input.allowResendEmail && order.fulfillmentStatus === "delivered" && existingToken) {
    console.info("Paid delivery: skipped already delivered", {
      orderId: order.id,
      tokenId: existingToken.id,
    });
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
    console.info("Paid delivery: access token created", {
      orderId: order.id,
      tokenIdPrefix: tokenId.slice(0, 8),
    });
  } else {
    console.info("Paid delivery: access token reused", {
      orderId: order.id,
      tokenIdPrefix: tokenId.slice(0, 8),
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
  const customerEmail = order.customerEmail.trim().toLowerCase();
  const maskedCustomerEmail = maskEmail(customerEmail);
  let accessUrl = "";
  let failureReason = "";

  if (!customerEmail) {
    failureReason = "missing_order_email";
  } else if (!order.productName.trim()) {
    failureReason = "missing_product_name";
  } else if (!order.productTargetUrl) {
    failureReason = "missing_product_template_link";
  }

  if (failureReason) {
    await updateEmailDeliveryStatus(db, {
      id: emailDelivery.id,
      status: "failed",
      providerMessageId: null,
      lastError: failureReason,
      attemptsCountIncrement: 1,
      markSentNow: false,
      markDeliveredNow: false,
    });

    await markOrderFulfillmentDeliveryFailed(db, order.id);

    console.error("Paid delivery: precondition failed", {
      orderId: order.id,
      customerEmail: maskedCustomerEmail,
      emailDeliveryId: emailDelivery.id,
      reason: failureReason,
      fulfillmentStatusAfter: "delivery_failed",
    });

    return {
      status: "delivery_failed",
      tokenId,
      emailDeliveryId: emailDelivery.id,
      reusedToken: shouldReuseToken,
    };
  }

  try {
    const appBaseUrl = await getRequiredAppBaseUrl();
    accessUrl = buildAccessUrl(appBaseUrl, tokenId);
    console.info("Paid delivery: access URL built", {
      orderId: order.id,
      emailDeliveryId: emailDelivery.id,
      hasAccessUrl: Boolean(accessUrl),
      accessRoute: "/access/[token]",
    });
  } catch (error) {
    const reason = shortenError(error);
    const reasonCode = classifyDeliveryFailureReason(reason);

    await updateEmailDeliveryStatus(db, {
      id: emailDelivery.id,
      status: "failed",
      providerMessageId: null,
      lastError: `${reasonCode}: ${reason}`,
      attemptsCountIncrement: 1,
      markSentNow: false,
      markDeliveredNow: false,
    });

    await markOrderFulfillmentDeliveryFailed(db, order.id);

    console.error("Paid delivery: access URL build failed", {
      orderId: order.id,
      customerEmail: maskedCustomerEmail,
      emailDeliveryId: emailDelivery.id,
      reasonCode,
      reason,
      fulfillmentStatusAfter: "delivery_failed",
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
    templateIdFallback: DEFAULT_PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
    deliveryTemplateType: DELIVERY_TEMPLATE_TYPE,
    provider: DELIVERY_PROVIDER,
    emailDeliveryId: emailDelivery.id,
    hasAccessUrl: Boolean(accessUrl),
    reusedToken: shouldReuseToken,
  });

  const sendResult = await sendPaidProductDeliveryEmail({
    orderId: order.id,
    customerEmail,
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
      fulfillmentStatusAfter: "delivered",
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
    lastError: `${classifyDeliveryFailureReason(sendResult.error)}: ${sendResult.error}`,
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
    reasonCode: classifyDeliveryFailureReason(sendResult.error),
    reason: shortenError(sendResult.error),
    fulfillmentStatusAfter: "delivery_failed",
  });

  return {
    status: "delivery_failed",
    tokenId,
    emailDeliveryId: emailDelivery.id,
    reusedToken: shouldReuseToken,
  };
};
