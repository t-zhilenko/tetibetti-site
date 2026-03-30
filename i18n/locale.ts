import {hasLocale} from "next-intl";
import {routing, type Locale} from "@/i18n/routing";

export const toValidLocale = (value: string): Locale | null =>
  hasLocale(routing.locales, value) ? value : null;

export const resolveLocale = async <T extends {locale: string}>(
  params: Promise<T>
): Promise<Locale | null> => {
  const {locale: localeParam} = await params;
  return toValidLocale(localeParam);
};
