import { getCloudflareContext } from "@opennextjs/cloudflare";

declare global {
  interface CloudflareEnv {
    FONDY_MERCHANT_ID?: string;
    FONDY_SECRET_KEY?: string;
    APP_BASE_URL?: string;
    BREVO_API_KEY?: string;
    BREVO_SENDER_EMAIL?: string;
    BREVO_SENDER_NAME?: string;
  }
}

type RequiredPaymentEnv = {
  fondyMerchantId: string;
  fondySecretKey: string;
  appBaseUrl: string;
};

type RequiredBrevoEnv = {
  brevoApiKey: string;
  brevoSenderEmail: string;
  brevoSenderName: string;
};

export class MissingPaymentEnvError extends Error {
  readonly missingKeys: string[];

  constructor(missingKeys: string[]) {
    super(`Missing required payment env: ${missingKeys.join(", ")}`);
    this.name = "MissingPaymentEnvError";
    this.missingKeys = missingKeys;
  }
}

export class MissingBrevoEnvError extends Error {
  readonly missingKeys: string[];

  constructor(missingKeys: string[]) {
    super(`Missing required Brevo env: ${missingKeys.join(", ")}`);
    this.name = "MissingBrevoEnvError";
    this.missingKeys = missingKeys;
  }
}

export class MissingAppBaseUrlEnvError extends Error {
  constructor() {
    super("Missing required env: APP_BASE_URL");
    this.name = "MissingAppBaseUrlEnvError";
  }
}

export class InvalidBaseUrlEnvError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBaseUrlEnvError";
  }
}

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, "");

const toNormalizedAbsoluteUrl = (rawValue: string): string => {
  const value = normalizeBaseUrl(rawValue.trim());
  let parsed: URL;

  try {
    parsed = new URL(value);
  } catch {
    throw new InvalidBaseUrlEnvError("APP_BASE_URL must be a valid absolute URL");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new InvalidBaseUrlEnvError("APP_BASE_URL must use http or https");
  }

  return normalizeBaseUrl(parsed.toString());
};

const getCloudflareEnv = async (): Promise<CloudflareEnv> => {
  const { env } = await getCloudflareContext({ async: true });
  return env;
};

export const getRequiredPaymentEnv = async (): Promise<RequiredPaymentEnv> => {
  const env = await getCloudflareEnv();

  const fondyMerchantId =
    env.FONDY_MERCHANT_ID ?? process.env.FONDY_MERCHANT_ID ?? "";
  const fondySecretKey = env.FONDY_SECRET_KEY ?? process.env.FONDY_SECRET_KEY ?? "";
  const appBaseUrlRaw = env.APP_BASE_URL ?? process.env.APP_BASE_URL ?? "";

  const missingKeys = [
    !fondyMerchantId ? "FONDY_MERCHANT_ID" : "",
    !fondySecretKey ? "FONDY_SECRET_KEY" : "",
    !appBaseUrlRaw ? "APP_BASE_URL" : "",
  ].filter((key): key is string => Boolean(key));

  if (missingKeys.length > 0) {
    throw new MissingPaymentEnvError(missingKeys);
  }

  return {
    fondyMerchantId,
    fondySecretKey,
    appBaseUrl: toNormalizedAbsoluteUrl(appBaseUrlRaw),
  };
};

export const getRequiredAppBaseUrl = async (): Promise<string> => {
  const env = await getCloudflareEnv();
  const appBaseUrlRaw = env.APP_BASE_URL ?? process.env.APP_BASE_URL ?? "";

  if (!appBaseUrlRaw) {
    throw new MissingAppBaseUrlEnvError();
  }

  return toNormalizedAbsoluteUrl(appBaseUrlRaw);
};

export const getRequiredBrevoEnv = async (): Promise<RequiredBrevoEnv> => {
  const env = await getCloudflareEnv();

  const brevoApiKey = env.BREVO_API_KEY ?? process.env.BREVO_API_KEY ?? "";
  const brevoSenderEmail = env.BREVO_SENDER_EMAIL ?? process.env.BREVO_SENDER_EMAIL ?? "";
  const brevoSenderName = env.BREVO_SENDER_NAME ?? process.env.BREVO_SENDER_NAME ?? "";

  const missingKeys = [
    !brevoApiKey ? "BREVO_API_KEY" : "",
    !brevoSenderEmail ? "BREVO_SENDER_EMAIL" : "",
    !brevoSenderName ? "BREVO_SENDER_NAME" : "",
  ].filter((key): key is string => Boolean(key));

  if (missingKeys.length > 0) {
    throw new MissingBrevoEnvError(missingKeys);
  }

  return {
    brevoApiKey,
    brevoSenderEmail,
    brevoSenderName,
  };
};

export const getOptionalAppBaseUrl = async (): Promise<string | null> => {
  let envAppBaseUrl = "";
  try {
    const env = await getCloudflareEnv();
    envAppBaseUrl = env.APP_BASE_URL ?? "";
  } catch {
    envAppBaseUrl = "";
  }

  const appBaseUrlRaw = envAppBaseUrl || process.env.APP_BASE_URL || "";

  if (!appBaseUrlRaw) {
    return null;
  }

  try {
    return toNormalizedAbsoluteUrl(appBaseUrlRaw);
  } catch {
    return null;
  }
};
