import { NextResponse } from "next/server";
import { brevoConfig, type BrevoActionKey } from "@/lib/brevo/config";
import {
  getBrevoEnv,
  sendTransactionalEmail,
  upsertContact,
} from "@/lib/brevo/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function handleBrevoAction(
  request: Request,
  action: BrevoActionKey
) {
  let payload: { email?: unknown };

  try {
    payload = (await request.json()) as { email?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
  }

  const actionConfig = brevoConfig.actions[action];
  if (!actionConfig) {
    return NextResponse.json(
      { ok: false, error: "Unsupported action" },
      { status: 400 }
    );
  }

  console.log("BREVO action", {
    action,
    listIds: actionConfig.listIdsToAdd,
    tags: actionConfig.tagsToAdd,
    templateId: actionConfig.sendTemplateId ?? null,
  });

  let env: ReturnType<typeof getBrevoEnv>;
  try {
    env = getBrevoEnv();
  } catch (error) {
    console.error("BREVO env missing", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { ok: false, error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    await upsertContact({
      apiKey: env.apiKey,
      email,
      listIds: actionConfig.listIdsToAdd,
      tags: actionConfig.tagsToAdd,
      attributes: actionConfig.attributes,
    });
  } catch (error) {
    console.error("Brevo contact error", error);
    return NextResponse.json(
      { ok: false, error: "Brevo contact error" },
      { status: 502 }
    );
  }

  if (actionConfig.sendTemplateId) {
    try {
      await sendTransactionalEmail({
        apiKey: env.apiKey,
        templateId: actionConfig.sendTemplateId,
        toEmail: email,
        senderEmail: env.senderEmail,
        senderName: env.senderName,
        params: actionConfig.templateParams,
      });
    } catch (error) {
      console.error("Brevo SMTP error", error);
    }
  }

  return NextResponse.json({ ok: true });
}
