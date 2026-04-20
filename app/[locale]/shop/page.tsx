import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import {notFound} from "next/navigation";
import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import {toProductCardItem} from "@/components/product-card-data";
import {resolveLocale} from "@/i18n/locale";
import {buildLocalizedPageMetadata} from "@/i18n/metadata";
import {getProductsWithCommerce} from "@/lib/server/product-page-data";

export const dynamic = "force-dynamic";

type ShopPageProps = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: ShopPageProps): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    params,
    pathname: "/shop",
    namespace: "Pages.shop.meta",
  });
}

export default async function ShopPage({params}: ShopPageProps) {
  const locale = await resolveLocale(params);

  if (!locale) {
    notFound();
  }

  const t = await getTranslations({locale, namespace: "Pages.shop"});
  const products = await getProductsWithCommerce(locale);

  return (
    <section className="bg-[#fbf3f4]">
      <Container className="py-24 md:py-20">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10 md:mb-12">
          <h1 className="text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-deep/90">
            {t("title")}
          </h1>
          <p className="text-[13px] md:text-[15px] leading-relaxed text-deep/70">
            {t("description")}
          </p>
        </div>
        <div className="grid gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-12">
          {products.map((product) => (
            <div key={product.slug} className="mx-auto w-full max-w-[340px]">
              <ProductCard item={toProductCardItem(product)} />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
