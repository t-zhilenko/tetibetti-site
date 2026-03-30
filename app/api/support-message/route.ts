const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SUPPORT_EMAIL = "teti.betti.studio@gmail.com";
const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

type SupportPayload = {
  productSlug?: string;
  email?: string;
  message?: string;
  pageUrl?: string;
};

export async function POST(request: Request) {
  let payload: SupportPayload;

  try {
    payload = (await request.json()) as SupportPayload;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const productSlug =
    typeof payload.productSlug === "string" ? payload.productSlug.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const message =
    typeof payload.message === "string" ? payload.message.trim() : "";
  const pageUrl =
    typeof payload.pageUrl === "string" ? payload.pageUrl.trim() : "";

  if (!productSlug) {
    return jsonResponse({ ok: false, error: "Missing product" }, 400);
  }

  if (email && !EMAIL_RE.test(email)) {
    return jsonResponse({ ok: false, error: "Invalid email" }, 400);
  }

  if (!message || message.length < 10) {
    return jsonResponse({ ok: false, error: "Message too short" }, 400);
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey || !senderEmail || !senderName) {
    console.error("SUPPORT env missing", {
      hasApiKey: Boolean(apiKey),
      hasSenderEmail: Boolean(senderEmail),
      hasSenderName: Boolean(senderName),
    });
    return jsonResponse({ ok: false, error: "Server configuration error" }, 500);
  }

  const subject = `Product question: ${productSlug}`;
  const safeEmail = email || "Not provided";
  const safeUrl = pageUrl || "Not provided";
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5;">
      <p><strong>Product:</strong> ${productSlug}</p>
      <p><strong>From:</strong> ${safeEmail}</p>
      <p><strong>Page:</strong> ${safeUrl}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    </div>
  `;

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          email: senderEmail,
          name: senderName,
        },
        to: [{ email: SUPPORT_EMAIL }],
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
      const errorText = await response.text().catch(() => "");
      console.error("Brevo support send failed:", response.status, errorText);
      return jsonResponse({ ok: false, error: "Unable to send message" }, 502);
    }
  } catch (error) {
    console.error("Brevo support send error:", error);
    return jsonResponse({ ok: false, error: "Unable to send message" }, 502);
  }

  return jsonResponse({ ok: true });
}
