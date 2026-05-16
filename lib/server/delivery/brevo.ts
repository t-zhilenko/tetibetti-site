import {
  MissingBrevoEnvError,
  getRequiredBrevoEnv,
} from "@/lib/server/env";
import { sendTransactionalEmail } from "@/lib/brevo/client";

export type PaidDeliveryEmailInput = {
  orderId: string;
  customerEmail: string;
  accessUrl: string;
  productName: string;
  supportEmail: string;
};

export type SendPaidProductDeliveryEmailResult =
  | {
      ok: true;
      providerMessageId: string | null;
      templateId: number;
    }
  | {
      ok: false;
      providerMessageId: string | null;
      templateId: number;
      error: string;
    };

export const DEFAULT_PAID_PRODUCT_DELIVERY_TEMPLATE_ID = 6;

const shortenError = (value: string): string => value.slice(0, 500);

export const sendPaidProductDeliveryEmail = async (
  input: PaidDeliveryEmailInput,
): Promise<SendPaidProductDeliveryEmailResult> => {
  let env: Awaited<ReturnType<typeof getRequiredBrevoEnv>>;
  try {
    env = await getRequiredBrevoEnv();
  } catch (error) {
    if (error instanceof MissingBrevoEnvError) {
      return {
        ok: false,
        providerMessageId: null,
        templateId: DEFAULT_PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
        error: `Missing Brevo paid-delivery configuration: ${error.missingKeys.join(", ")}`,
      };
    }

    return {
      ok: false,
      providerMessageId: null,
      templateId: DEFAULT_PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
      error: "Missing Brevo paid-delivery configuration",
    };
  }

  const templateId = env.paidDeliveryTemplateId ?? DEFAULT_PAID_PRODUCT_DELIVERY_TEMPLATE_ID;

  try {
    console.info("Paid delivery Brevo send requested", {
      orderId: input.orderId,
      templateId,
      hasRecipient: Boolean(input.customerEmail),
      hasAccessUrl: Boolean(input.accessUrl),
      hasSupportEmail: Boolean(input.supportEmail),
    });

    const sendOutcome = await sendTransactionalEmail({
      apiKey: env.brevoApiKey,
      templateId,
      toEmail: input.customerEmail,
      senderEmail: env.brevoSenderEmail,
      senderName: env.brevoSenderName,
      params: {
        // Keep aliases to stay compatible with template param naming conventions.
        product_name: input.productName,
        productName: input.productName,
        PRODUCT_NAME: input.productName,
        access_url: input.accessUrl,
        accessUrl: input.accessUrl,
        ACCESS_URL: input.accessUrl,
        support_email: input.supportEmail,
        supportEmail: input.supportEmail,
        SUPPORT_EMAIL: input.supportEmail,
      },
    });

    return {
      ok: true,
      providerMessageId: sendOutcome.providerMessageId,
      templateId,
    };
  } catch (error) {
    console.error("Paid delivery Brevo send failed", {
      orderId: input.orderId,
      templateId,
      message: error instanceof Error ? error.message : "Unknown Brevo send error",
    });

    return {
      ok: false,
      providerMessageId: null,
      templateId,
      error: shortenError(error instanceof Error ? error.message : "Unknown Brevo send error"),
    };
  }
};
