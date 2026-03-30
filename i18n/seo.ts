import type {Locale} from "@/i18n/routing";

export const getLocalizedPath = (locale: Locale, pathname = "/") => {
  const normalized = pathname === "/" ? "" : pathname;
  return `/${locale}${normalized}`;
};

export const getHreflang = (pathname = "/") => {
  const normalized = pathname === "/" ? "" : pathname;
  return {
    en: `/en${normalized}`,
    uk: `/uk${normalized}`,
    "x-default": `/en${normalized}`,
  };
};
