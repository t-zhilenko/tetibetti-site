import type {Metadata} from "next";
import {hasLocale} from "next-intl";
import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import {getProducts} from "@/content/products";
import {routing, type Locale} from "@/i18n/routing";
import {getHreflang, getLocalizedPath} from "@/i18n/seo";

type ShopPageProps = {
  params: Promise<{locale: string}>;
};

const toValidLocale = (value: string): Locale | null =>
  hasLocale(routing.locales, value) ? value : null;

export async function generateMetadata({params}: ShopPageProps): Promise<Metadata> {
  const {locale: localeParam} = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    return {};
  }

  const t = await getTranslations({locale, namespace: "Pages.shop.meta"});
  const canonicalPath = getLocalizedPath(locale, "/shop");

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalPath,
      languages: getHreflang("/shop"),
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

export default async function ShopPage({params}: ShopPageProps) {
  const {locale: localeParam} = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    notFound();
  }

  const products = getProducts(locale);

  return (
    <section className="bg-[#fbf3f4]">
      <Container className="py-24 md:py-20">
        <div className="grid gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-12">
          {products.map((product) => (
            <div key={product.slug} className="mx-auto w-full max-w-[340px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
