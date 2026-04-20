import {
  MissingBrevoEnvError,
  getRequiredBrevoEnv,
} from "@/lib/server/env";

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

const BREVO_SMTP_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
export const PAID_PRODUCT_DELIVERY_TEMPLATE_ID = 6;

const shortenError = (value: string): string => value.slice(0, 500);

const extractProviderMessageId = (responseText: string): string | null => {
  try {
    const parsed = JSON.parse(responseText) as { messageId?: unknown; messageIds?: unknown };

    if (typeof parsed.messageId === "string" && parsed.messageId.trim()) {
      return parsed.messageId.trim();
    }

    if (Array.isArray(parsed.messageIds) && typeof parsed.messageIds[0] === "string") {
      return parsed.messageIds[0].trim();
    }
  } catch {
    // Ignore parse errors. Provider message id is optional for success handling.
  }

  return null;
};

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
        templateId: PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
        error: `Missing Brevo paid-delivery configuration: ${error.missingKeys.join(", ")}`,
      };
    }

    return {
      ok: false,
      providerMessageId: null,
      templateId: PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
      error: "Missing Brevo paid-delivery configuration",
    };
  }

  const body = {
    to: [{ email: input.customerEmail }],
    sender: { email: env.brevoSenderEmail, name: env.brevoSenderName },
    templateId: PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
    params: {
      product_name: input.productName,
      access_url: input.accessUrl,
      support_email: input.supportEmail,
    },
  };

  try {
    const response = await fetch(BREVO_SMTP_ENDPOINT, {
      method: "POST",
      headers: {
        "api-key": env.brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    const providerMessageId = extractProviderMessageId(responseText);

    if (!response.ok) {
      const reason = responseText.trim()
        ? `Brevo paid-delivery send failed with HTTP ${response.status}: ${responseText}`
        : `Brevo paid-delivery send failed with HTTP ${response.status}`;

      return {
        ok: false,
        providerMessageId,
        templateId: PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
        error: shortenError(reason),
      };
    }

    return {
      ok: true,
      providerMessageId,
      templateId: PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
    };
  } catch (error) {
    return {
      ok: false,
      providerMessageId: null,
      templateId: PAID_PRODUCT_DELIVERY_TEMPLATE_ID,
      error: shortenError(error instanceof Error ? error.message : "Unknown Brevo send error"),
    };
  }
};
