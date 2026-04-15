import Container from "@/components/Container";
import ProductCarousel from "@/components/ProductCarousel";
import {toProductCardItem} from "@/components/product-card-data";
import {VIEW_ALL_BUTTON_CLASS} from "@/components/view-all-button-class";
import {Link} from "@/i18n/navigation";
import {useTranslations} from "next-intl";
import type {ProductConfig} from "@/content/products";

type FeaturedProductsProps = {
  products: ProductConfig[];
};

export default function FeaturedProducts({products}: FeaturedProductsProps) {
  const t = useTranslations("Home.featured");
  const items = products.map((product) => toProductCardItem(product));

  return (
    <section className="bg-[#fbf3f4]">
      <Container className="py-24 md:py-18">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-deep/50">{t("label")}</p>
          <h2 className="text-2xl md:text-3xl">{t("title")}</h2>
          <p className="mx-auto max-w-xl text-[13px] text-deep/70">{t("description")}</p>
        </div>
        <div className="mt-6">
          <ProductCarousel products={items} />
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className={VIEW_ALL_BUTTON_CLASS}
          >
            {t("viewAll")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
