import { brevoConfig, type BrevoActionKey } from "@/lib/brevo/config";
import {
  getBrevoEnv,
  sendTransactionalEmail,
  upsertContact,
} from "@/lib/brevo/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });

export async function handleBrevoAction(
  request: Request,
  action: BrevoActionKey
) {
  let payload: { email?: unknown };

  try {
    payload = (await request.json()) as { email?: unknown };
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON" }, 400);
  }

  const email = typeof payload.email === "string" ? payload.email.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return jsonResponse({ ok: false, error: "Invalid email" }, 400);
  }

  const actionConfig = brevoConfig.actions[action];
  if (!actionConfig) {
    return jsonResponse({ ok: false, error: "Unsupported action" }, 400);
  }

  const sendTemplateId =
    "sendTemplateId" in actionConfig ? actionConfig.sendTemplateId : undefined;
  const attributes =
    "attributes" in actionConfig ? actionConfig.attributes : undefined;
  const templateParams =
    "templateParams" in actionConfig ? actionConfig.templateParams : undefined;

  console.log("BREVO action", {
    action,
    listIds: actionConfig.listIdsToAdd,
    tags: actionConfig.tagsToAdd,
    templateId: sendTemplateId ?? null,
  });

  let env: ReturnType<typeof getBrevoEnv>;
  try {
    env = getBrevoEnv();
  } catch (error) {
    console.error("BREVO env missing", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse({ ok: false, error: "Server configuration error" }, 500);
  }

  try {
    await upsertContact({
      apiKey: env.apiKey,
      email,
      listIds: actionConfig.listIdsToAdd,
      tags: actionConfig.tagsToAdd,
      attributes,
    });
  } catch (error) {
    console.error("Brevo contact error", error);
    return jsonResponse({ ok: false, error: "Brevo contact error" }, 502);
  }

  if (sendTemplateId) {
    try {
      await sendTransactionalEmail({
        apiKey: env.apiKey,
        templateId: sendTemplateId,
        toEmail: email,
        senderEmail: env.senderEmail,
        senderName: env.senderName,
        params: templateParams,
      });
    } catch (error) {
      console.error("Brevo SMTP error", error);
    }
  }

  return jsonResponse({ ok: true });
}
