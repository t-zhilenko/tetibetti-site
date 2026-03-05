import { NextResponse } from "next/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let payload: {
    email?: string;
    product?: string;
    lang?: "en" | "uk";
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const product = payload.product;
  const lang = payload.lang;

  console.log("WAITLIST endpoint hit", { product, email });

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  if (product !== "nutrition-meal-planner") {
    return NextResponse.json(
      { ok: false, error: "Unsupported product" },
      { status: 400 }
    );
  }

  if (lang !== "en" && lang !== "uk") {
    return NextResponse.json({ ok: false, error: "Invalid language" }, { status: 400 });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey || !senderEmail || !senderName) {
    console.error("WAITLIST env missing", {
      hasApiKey: Boolean(apiKey),
      hasSenderEmail: Boolean(senderEmail),
      hasSenderName: Boolean(senderName),
    });
    return NextResponse.json(
      { ok: false, error: "Server configuration error" },
      { status: 500 }
    );
  }

  const tags = [
    "waitlist",
    "waitlist_nutrition_meal_planner",
    "product_nutrition_meal_planner",
    "source_website",
    `lang_${lang}`,
  ];

  let contactResponse: Response;
  try {
    contactResponse = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        updateEnabled: true,
        listIds: [3, 7],
        tags,
        attributes: {
          WAITLIST_PRODUCT: "Nutrition Meal Planner",
          WAITLIST_SOURCE: "website",
          WAITLIST_RELEASE: "2026-03-29",
        },
      }),
    });
  } catch (error) {
    console.error("Brevo contact request failed", error);
    return NextResponse.json(
      { ok: false, error: "Brevo contact error" },
      { status: 502 }
    );
  }

  if (!contactResponse.ok) {
    const errorText = await contactResponse.text().catch(() => "");
    console.error("Brevo contact error:", contactResponse.status, errorText);
    return NextResponse.json(
      { ok: false, error: "Brevo contact error" },
      { status: 502 }
    );
  }

  try {
    const smtpResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        to: [{ email }],
        templateId: 5,
        sender: {
          email: senderEmail,
          name: senderName,
        },
        params: {
          PRODUCT_NAME: "Nutrition Meal Planner",
          RELEASE_DATE: "March 29",
        },
      }),
    });
    if (!smtpResponse.ok) {
      const errorText = await smtpResponse.text().catch(() => "");
      console.error("Brevo SMTP send failed:", smtpResponse.status, errorText);
    }
  } catch {
    // Ignore email errors if contact was saved.
  }

  return NextResponse.json({ ok: true });
}
