const BREVO_ENDPOINT = "https://api.brevo.com/v3/contacts";
const LIST_ID = 3;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
