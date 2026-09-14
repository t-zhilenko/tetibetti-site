import {useTranslations} from "next-intl";
import Container from "@/components/Container";
import SaleCarousel from "@/components/sale/SaleCarousel";
import {VIEW_ALL_BUTTON_CLASS} from "@/components/view-all-button-class";
import {SALE_CHANNEL_URL, saleItems} from "@/content/sale";
import {Link} from "@/i18n/navigation";

export default function FeaturedSale() {
  const t = useTranslations("Home.sale");
  const items = saleItems.filter((item) => !item.sold);

  if (!items.length) {
    return null;
  }

  return (
    <section className="border-t border-deep/10 bg-[#fbf3f4]">
      <Container className="py-14 md:py-16">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-deep/50">{t("label")}</p>
          <h2 className="text-2xl md:text-3xl">{t("title")}</h2>
          <p className="mx-auto max-w-xl text-[13px] text-deep/70">{t("description", {count: items.length})}</p>
        </div>
        <div className="mt-6">
          <SaleCarousel items={items} ctaLabel={t("open")} />
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/rozprodazh" className={VIEW_ALL_BUTTON_CLASS}>
            {t("viewAll")}
          </Link>
          <a
            href={SALE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={VIEW_ALL_BUTTON_CLASS}
          >
            {t("channel")}
          </a>
        </div>
      </Container>
    </section>
  );
}
