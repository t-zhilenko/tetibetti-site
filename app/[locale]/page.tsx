import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import EmailSubscription from "@/components/EmailSubscription";
import {getProducts} from "@/content/products";
import {routing, type Locale} from "@/i18n/routing";
import {getHreflang, getLocalizedPath} from "@/i18n/seo";

type HomePageProps = {
  params: Promise<{locale: string}>;
};

const toValidLocale = (value: string): Locale | null =>
  hasLocale(routing.locales, value) ? value : null;

export async function generateMetadata({params}: HomePageProps): Promise<Metadata> {
  const {locale: localeParam} = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    return {};
  }

  const t = await getTranslations({locale, namespace: "Pages.home.meta"});
  const canonicalPath = getLocalizedPath(locale, "/");

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalPath,
      languages: getHreflang("/"),
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

export default async function HomePage({params}: HomePageProps) {
  const {locale: localeParam} = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    notFound();
  }

  const products = getProducts(locale);

  return (
    <>
      <Hero />
      <FeaturedProducts products={products} />
      <EmailSubscription />
    </>
  );
}
