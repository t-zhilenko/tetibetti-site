import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import {Link} from "@/i18n/navigation";
import {useTranslations} from "next-intl";
import type {ProductConfig} from "@/content/products";

type FeaturedProductsProps = {
  products: ProductConfig[];
};

export default function FeaturedProducts({products}: FeaturedProductsProps) {
  const t = useTranslations("Home.featured");

  return (
    <section className="bg-[#fbf3f4]">
      <Container className="py-24 md:py-18">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-deep/50">{t("label")}</p>
          <h2 className="text-2xl md:text-3xl">{t("title")}</h2>
          <p className="mx-auto max-w-xl text-[13px] text-deep/70">{t("description")}</p>
        </div>
        <div className="mt-16">
          <div className="grid gap-12 md:gap-10 lg:gap-12 md:[grid-template-columns:repeat(auto-fit,minmax(240px,340px))] md:justify-center">
            {products.map((product) => (
              <div key={product.slug} className="mx-auto w-full max-w-[340px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full border border-deep/30 px-5 py-2 text-[13px] font-medium text-deep/70 hover:text-deep"
          >
            {t("viewAll")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
