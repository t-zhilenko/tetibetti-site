import {
  MissingBrevoEnvError,
  getRequiredBrevoEnv,
} from "@/lib/server/env";
import { getSupportEmail } from "@/lib/server/support";
import { isUuid } from "@/lib/server/security";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRODUCT_SLUG_RE = /^[a-z0-9-]+$/;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_PAGE_URL_LENGTH = 500;
const MAX_PRODUCT_SLUG_LENGTH = 120;
const MAX_SUBJECT_LENGTH = 200;

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

type SupportPayload = {
  productSlug?: string;
  contextType?: string;
  orderId?: string;
  subject?: string;
  email?: string;
  message?: string;
  pageUrl?: string;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const toSafePageUrl = (rawValue: string): string => {
  if (!rawValue) {
    return "Not provided";
  }

  if (rawValue.length > MAX_PAGE_URL_LENGTH) {
    return "Not provided";
  }

  try {
    const parsed = new URL(rawValue);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return "Not provided";
    }
    return parsed.toString();
  } catch {
    return "Not provided";
  }
};

export async function POST(request: Request) {
  let payload: SupportPayload;

  try {
    payload = (await request.json()) as SupportPayload;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const productSlug =
    typeof payload.productSlug === "string" ? payload.productSlug.trim().toLowerCase() : "";
  const contextTypeRaw =
    typeof payload.contextType === "string" ? payload.contextType.trim().toLowerCase() : "";
  const contextType =
    contextTypeRaw === "order_support" ? "order_support" : "product_question";
  const orderIdRaw = typeof payload.orderId === "string" ? payload.orderId.trim() : "";
  const subjectOverride =
    typeof payload.subject === "string" ? payload.subject.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";
  const pageUrl =
    typeof payload.pageUrl === "string" ? payload.pageUrl.trim() : "";

  if (
    !productSlug ||
    productSlug.length > MAX_PRODUCT_SLUG_LENGTH ||
    !PRODUCT_SLUG_RE.test(productSlug)
  ) {
    return jsonResponse({ ok: false, error: "Missing product" }, 400);
  }
  if (contextType === "order_support" && !isUuid(orderIdRaw)) {
    return jsonResponse({ ok: false, error: "Invalid order" }, 400);
  }
  if (subjectOverride && subjectOverride.length > MAX_SUBJECT_LENGTH) {
    return jsonResponse({ ok: false, error: "Subject is too long" }, 400);
  }

  if (email && !EMAIL_RE.test(email)) {
    return jsonResponse({ ok: false, error: "Invalid email" }, 400);
  }

  if (!message || message.length < 10 || message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ ok: false, error: "Message length is invalid" }, 400);
  }

  let brevoEnv: Awaited<ReturnType<typeof getRequiredBrevoEnv>>;
  try {
    brevoEnv = await getRequiredBrevoEnv();
  } catch (error) {
    if (error instanceof MissingBrevoEnvError) {
      console.error("SUPPORT env missing", {
        missingKeys: error.missingKeys,
      });
      return jsonResponse({ ok: false, error: "Server configuration error" }, 500);
    }

    console.error("SUPPORT env validation failed");
    return jsonResponse({ ok: false, error: "Server configuration error" }, 500);
  }

  const subject =
    subjectOverride ||
    (contextType === "order_support" && orderIdRaw
      ? `Order support — ${orderIdRaw}`
      : `Product question: ${productSlug}`);
  const safeEmail = email || "Not provided";
  const safeUrl = toSafePageUrl(pageUrl);
  const contextLabel = contextType === "order_support" ? "Order support" : "Product question";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
      <p><strong>Context:</strong> ${escapeHtml(contextLabel)}</p>
      <p><strong>Product:</strong> ${escapeHtml(productSlug)}</p>
      ${orderIdRaw ? `<p><strong>Order ID:</strong> ${escapeHtml(orderIdRaw)}</p>` : ""}
      <p><strong>From:</strong> ${escapeHtml(safeEmail)}</p>
      <p><strong>Page:</strong> ${escapeHtml(safeUrl)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoEnv.brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: brevoEnv.brevoSenderEmail,
          name: brevoEnv.brevoSenderName,
        },
        to: [{ email: getSupportEmail() }],
        subject,
        htmlContent,
        ...(email
          ? {
              replyTo: {
                email,
              },
            }
          : {}),
      }),
    });

    if (!response.ok) {
      console.error("Brevo support send failed", {
        status: response.status,
      });
      return jsonResponse({ ok: false, error: "Unable to send message" }, 502);
    }
  } catch (error) {
    console.error("Brevo support send error", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse({ ok: false, error: "Unable to send message" }, 502);
  }

  return jsonResponse({ ok: true });
}
