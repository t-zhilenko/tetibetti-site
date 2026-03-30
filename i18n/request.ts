import {getRequestConfig} from "next-intl/server";
import {hasLocale} from "next-intl";
import {routing} from "@/i18n/routing";

type MessageRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is MessageRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const mergeMessages = (
  base: MessageRecord,
  overrides: MessageRecord
): MessageRecord => {
  const result: MessageRecord = {...base};

  Object.entries(overrides).forEach(([key, value]) => {
    const existingValue = result[key];
    if (isRecord(existingValue) && isRecord(value)) {
      result[key] = mergeMessages(existingValue, value);
      return;
    }
    result[key] = value;
  });

  return result;
};

export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
  const defaultMessages = (await import(`@/messages/${routing.defaultLocale}.json`))
    .default as MessageRecord;

  try {
    const localeMessages = (await import(`@/messages/${locale}.json`))
      .default as MessageRecord;
    const messages =
      locale === routing.defaultLocale
        ? defaultMessages
        : mergeMessages(defaultMessages, localeMessages);
    return {
      locale,
      messages
    };
  } catch {
    return {
      locale: routing.defaultLocale,
      messages: defaultMessages
    };
  }
});
