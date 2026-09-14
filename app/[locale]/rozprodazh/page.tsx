import type {Metadata} from "next";
import Container from "@/components/Container";
import SaleCatalog from "@/components/sale/SaleCatalog";
import {saleItemPhoto, saleItems} from "@/content/sale";
import {resolveLocale} from "@/i18n/locale";
import {buildLocalizedPageMetadata} from "@/i18n/metadata";

type SalePageProps = {
  params: Promise<{locale: string}>;
};

const siteUrl = "https://tetibetti.com";

const keywords = [
  "розпродаж речей",
  "брендові речі б/у",
  "бу речі",
  "секонд хенд",
  "секонд-хенд онлайн",
  "речі з шафи",
  "жіночий одяг б/у",
  "брендовий одяг вживаний",
  "Victoria's Secret б/у",
  "Guess б/у",
  "Levi's б/у",
  "Shur Shur",
  "For Love & Lemons",
  "DC Snowboarding",
  "Rossignol",
  "Linen Gallery",
  "Teti Betti",
];

export async function generateMetadata({params}: SalePageProps): Promise<Metadata> {
  const base = await buildLocalizedPageMetadata({
    params,
    pathname: "/rozprodazh",
    namespace: "Pages.rozprodazh.meta",
    twitterCard: "summary_large_image",
    robots: {index: true, follow: true},
  });
  const cover = saleItems.find((item) => !item.sold) ?? saleItems[0];
  const image = {
    url: saleItemPhoto(cover, 1),
    width: 960,
    height: 1280,
    alt: cover.title,
  };

  return {
    ...base,
    keywords,
    openGraph: {...base.openGraph, images: [image]},
    twitter: {...base.twitter, images: [image.url]},
  };
}

const terms = [
  "Речі з моєї шафи, які більше не ношу: брендовий одяг, білизна, зимовий спорт у стані б/у від «як новий» до «гарний». Більшість розмірів XS–S, решта вказана в картці.",
  "Це мій особистий секонд-хенд, а не магазин: кожну річ носила сама, стан описаний чесно, дефекти зняті окремо. Ціни орієнтовні, торг доречний, особливо за кілька речей разом.",
  "Відправляю Новою поштою по Україні за тарифами пошти. Самовивіз за домовленістю.",
  "Щоб купити, натисніть «Написати в Telegram» під річчю: повідомлення з номером уже буде заповнене.",
];

const buildStructuredData = (locale: string) => {
  const available = saleItems.filter((item) => !item.sold);
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Розпродаж брендових речей б/у з моєї шафи",
    url: `${siteUrl}/${locale}/rozprodazh`,
    numberOfItems: available.length,
    itemListElement: available.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: item.title,
        description: item.description,
        image: Array.from({length: Math.min(item.photos, 3)}, (_, k) => `${siteUrl}${saleItemPhoto(item, k + 1)}`),
        sku: `sale-${item.id}`,
        offers: {
          "@type": "Offer",
          price: item.price,
          priceCurrency: "UAH",
          availability: "https://schema.org/InStock",
          itemCondition: "https://schema.org/UsedCondition",
          url: `${siteUrl}/${locale}/rozprodazh`,
          seller: {"@type": "Person", name: "Тетяна, Teti Betti"},
        },
      },
    })),
  };
};

export default async function SalePage({params}: SalePageProps) {
  const locale = await resolveLocale(params);

  if (!locale) {
    return null;
  }

  const available = saleItems.filter((item) => !item.sold).length;

  return (
    <section className="relative overflow-hidden bg-soft bg-[radial-gradient(900px_420px_at_80%_10%,rgba(223,194,192,0.12),transparent_70%)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(buildStructuredData(locale))}}
      />
      <Container className="py-12 md:py-16">
        <div className="max-w-[720px] space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-deep/50">Секонд-хенд з моєї шафи</p>
          <h1 className="text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-deep/90">
            Розпродаж брендових речей б/у: {available} речей шукають нових господарів
          </h1>
          <div className="space-y-2 text-[13px] md:text-[15px] leading-relaxed text-deep/75">
            {terms.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>

        <div className="mt-8 md:mt-10">
          <SaleCatalog items={saleItems} />
        </div>
      </Container>
    </section>
  );
}
