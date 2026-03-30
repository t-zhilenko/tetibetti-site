import "server-only";
import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {resolveLocale} from "@/i18n/locale";
import {getHreflang, getLocalizedPath} from "@/i18n/seo";

type LocalizedMetadataParams = Promise<{locale: string}>;

type BuildLocalizedPageMetadataInput = {
  params: LocalizedMetadataParams;
  pathname: string;
  namespace: string;
  twitterCard?: "summary" | "summary_large_image";
  robots?: Metadata["robots"];
};

export async function buildLocalizedPageMetadata({
  params,
  pathname,
  namespace,
  twitterCard = "summary",
  robots,
}: BuildLocalizedPageMetadataInput): Promise<Metadata> {
  const locale = await resolveLocale(params);

  if (!locale) {
    return {};
  }

  const t = await getTranslations({locale, namespace});
  const title = t("title");
  const description = t("description");
  const canonicalPath = getLocalizedPath(locale, pathname);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
      languages: getHreflang(pathname),
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      type: "website",
    },
    twitter: {
      card: twitterCard,
      title,
      description,
    },
    ...(robots ? {robots} : {}),
  };
}
