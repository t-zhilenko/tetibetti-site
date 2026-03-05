const BREVO_CONTACTS_ENDPOINT = "https://api.brevo.com/v3/contacts";
const BREVO_SMTP_ENDPOINT = "https://api.brevo.com/v3/smtp/email";

type UpsertContactInput = {
  apiKey: string;
  email: string;
  listIds: number[];
  tags?: string[];
  attributes?: Record<string, string>;
};

type SendTransactionalEmailInput = {
  apiKey: string;
  templateId: number;
  toEmail: string;
  senderEmail?: string;
  senderName?: string;
  params?: Record<string, string>;
};

export const getBrevoEnv = () => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME;

  if (!apiKey) {
    throw new Error("Missing Brevo API key");
  }

  return {
    apiKey,
    senderEmail,
    senderName,
  };
};

export async function upsertContact({
  apiKey,
  email,
  listIds,
  tags,
  attributes,
}: UpsertContactInput) {
  const response = await fetch(BREVO_CONTACTS_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      email,
      updateEnabled: true,
      listIds,
      ...(tags?.length ? { tags } : {}),
      ...(attributes ? { attributes } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Brevo contact error: ${response.status} ${errorText || ""}`.trim()
    );
  }
}

export async function sendTransactionalEmail({
  apiKey,
  templateId,
  toEmail,
  senderEmail,
  senderName,
  params,
}: SendTransactionalEmailInput) {
  const body: Record<string, unknown> = {
    to: [{ email: toEmail }],
    templateId,
  };

  if (senderEmail && senderName) {
    body.sender = { email: senderEmail, name: senderName };
  }

  if (params) {
    body.params = params;
  }

  const response = await fetch(BREVO_SMTP_ENDPOINT, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(
      `Brevo SMTP error: ${response.status} ${errorText || ""}`.trim()
    );
  }
}
