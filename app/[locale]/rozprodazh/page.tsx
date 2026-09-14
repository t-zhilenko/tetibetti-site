import type {Metadata} from "next";
import Container from "@/components/Container";
import SaleCatalog from "@/components/sale/SaleCatalog";
import {Send} from "lucide-react";
import {SALE_CHANNEL_URL, saleItemPhoto, saleItems} from "@/content/sale";
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
  "натуральні тканини шовк льон вовна",
  "знахідки із секонду",
  "речі для дому б/у",
  "Теті продає",
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

const lead =
  "Брендовий одяг із натуральних тканин, білизна і зимовий спорт із моєї шафи, стан б/у від «як новий» до «гарний». Розміри переважно XS–S, торг доречний, Нова пошта по Україні. Щоб купити, тисніть «Написати в Telegram» під річчю.";

const details = [
  "Це мій особистий секонд-хенд, а не магазин: кожну річ носила сама, стан описаний чесно, дефекти зняті окремо. Ціни орієнтовні, особливо за кілька речей разом можна домовитись.",
  "Віддаю перевагу приємним і натуральним тканинам: шовк, льон, вовна. Розмір, якого немає в картці, уточню в чаті.",
  "З часом тут з'являться і мої знахідки із секондів, які відбираю сама, а також побутові речі не з одягу, якими ми користувались і вирішили продати.",
  "Відправляю Новою поштою по Україні за тарифами пошти. Самовивіз за домовленістю. Повідомлення з номером речі заповнюється саме.",
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
      <Container className="pt-8 pb-12 md:pt-10 md:pb-16">
        <div className="max-w-[720px] space-y-4">
          <p className="text-xs uppercase tracking-[0.3em] text-deep/50">Секонд-хенд з моєї шафи</p>
          <h1 className="text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-deep/90">
            Розпродаж брендових речей б/у: {available} речей шукають нових господарів
          </h1>
          <p className="text-[13px] md:text-[15px] leading-relaxed text-deep/75">{lead}</p>
          <details className="group text-[13px] md:text-[15px] leading-relaxed text-deep/75">
            <summary className="cursor-pointer list-none text-[13px] text-deep/55 underline decoration-deep/25 underline-offset-4 hover:text-deep [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">Докладніше про стан, доставку і що буде далі</span>
              <span className="hidden group-open:inline">Згорнути</span>
            </summary>
            <div className="mt-3 space-y-2">
              {details.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </details>
          <a
            href={SALE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-deep/10 bg-blush/60 px-5 py-2.5 text-[13px] font-medium text-deep/80 transition-colors hover:bg-blush/70"
          >
            <Send size={15} />
            Канал «Теті продає»: нові речі й дропи
          </a>
        </div>

        <div className="mt-8 md:mt-10">
          <SaleCatalog items={saleItems} />
        </div>
      </Container>
    </section>
  );
}
