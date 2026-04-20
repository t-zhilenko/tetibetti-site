const DEFAULT_SUPPORT_EMAIL = "support@tetibetti.com";

export const getSupportEmail = (): string =>
  process.env.SUPPORT_EMAIL ||
  process.env.BREVO_SUPPORT_EMAIL ||
  process.env.BREVO_SENDER_EMAIL ||
  DEFAULT_SUPPORT_EMAIL;
