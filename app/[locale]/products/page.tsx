import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {getTranslations} from "next-intl/server";
import {routing, type Locale} from "@/i18n/routing";
import {getHreflang, getLocalizedPath} from "@/i18n/seo";
import ShopPage from "../shop/page";

type ProductsPageProps = {
  params: Promise<{locale: string}>;
};

const toValidLocale = (value: string): Locale | null =>
  hasLocale(routing.locales, value) ? value : null;

export async function generateMetadata({params}: ProductsPageProps): Promise<Metadata> {
  const {locale: localeParam} = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    return {};
  }

  const t = await getTranslations({locale, namespace: "Pages.products.meta"});
  const canonicalPath = getLocalizedPath(locale, "/products");

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalPath,
      languages: getHreflang("/products"),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: canonicalPath,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: t("title"),
      description: t("description"),
    },
  };
}

export default function ProductsPage(props: ProductsPageProps) {
  return <ShopPage {...props} />;
}
