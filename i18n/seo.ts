import {routing, type Locale} from "@/i18n/routing";

export const getLocalizedPath = (locale: Locale, pathname = "/") => {
  const normalized = pathname === "/" ? "" : pathname;
  return `/${locale}${normalized}`;
};

export const getHreflang = (pathname = "/") => {
  const normalized = pathname === "/" ? "" : pathname;
  return {
    ...Object.fromEntries(routing.locales.map((locale) => [locale, `/${locale}${normalized}`])),
    "x-default": `/${routing.defaultLocale}${normalized}`,
  };
};
