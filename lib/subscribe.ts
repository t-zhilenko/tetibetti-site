const BREVO_ENDPOINT = "https://api.brevo.com/v3/contacts";
const BREVO_SMTP_ENDPOINT = "https://api.brevo.com/v3/smtp/email";
const LIST_ID = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitStore = new Map<string, number[]>();

const jsonResponse = (body: unknown, status = 200) => {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
};

type SubscribeBody = {
  email?: unknown;
  tag?: unknown;
  company?: unknown;
  website?: unknown;
  product?: unknown;
};

const getClientIp = (request: Request) => {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp;
  }
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }
  const realIp = request.headers.get("x-real-ip");
  return realIp || "unknown";
};

const isRateLimited = (key: string) => {
  const now = Date.now();
  const history = rateLimitStore.get(key) || [];
  const recent = history.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitStore.set(key, recent);
  return recent.length > RATE_LIMIT_MAX;
};

export async function handleSubscribe(
  request: Request,
  apiKey?: string | null
) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON." }, 400);
  }

  if (!payload || typeof payload !== "object") {
    return jsonResponse({ success: false, error: "Invalid JSON." }, 400);
  }

  const body = payload as SubscribeBody;

  const honeypot =
    (typeof body.company === "string" && body.company.trim()) ||
    (typeof body.website === "string" && body.website.trim());

  if (honeypot) {
    return jsonResponse({ success: true }, 200);
  }

  if (!apiKey) {
    return jsonResponse({ success: false, error: "Server misconfigured." }, 500);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const tag = typeof body.tag === "string" ? body.tag.trim() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return jsonResponse({ success: false, error: "Invalid email address." }, 400);
  }

  const ip = getClientIp(request);
  const rateKey = `${ip}|${email.toLowerCase()}`;
  if (isRateLimited(rateKey)) {
    return jsonResponse(
      { success: false, error: "Too many requests. Please try again shortly." },
      429
    );
  }

  const brevoPayload: {
    email: string;
    updateEnabled: boolean;
    listIds: number[];
    tags?: string[];
  } = {
    email,
    updateEnabled: true,
    listIds: [LIST_ID],
  };

  if (tag) {
    brevoPayload.tags = [tag];
  }

  const brevoResponse = await fetch(BREVO_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify(brevoPayload),
  });

  if (brevoResponse.ok) {
    try {
      const smtpResponse = await fetch(BREVO_SMTP_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          "api-key": apiKey,
        },
        body: JSON.stringify({
          to: [{ email }],
          templateId: 2,
        }),
      });

      if (!smtpResponse.ok) {
        console.error("Brevo SMTP send failed", {
          status: smtpResponse.status,
        });
      }
    } catch (error) {
      console.error("Brevo SMTP send error", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }

    return jsonResponse({ success: true }, 200);
  }

  let errorMessage = "Subscription failed.";
  try {
    const errorBody = (await brevoResponse.json()) as { message?: unknown };
    if (typeof errorBody?.message === "string" && errorBody.message.trim()) {
      errorMessage = errorBody.message;
    }
  } catch {
    // ignore parsing error
  }

  return jsonResponse(
    { success: false, error: errorMessage },
    brevoResponse.status || 502
  );
}
