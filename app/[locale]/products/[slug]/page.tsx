import type {Metadata} from "next";
import {notFound} from "next/navigation";
import ProductPageClient from "@/components/product/ProductPageClient";
import {getAllProductSlugs, getProductBySlug, getProducts} from "@/content/products";
import {toValidLocale} from "@/i18n/locale";
import {getHreflang, getLocalizedPath} from "@/i18n/seo";

export const dynamicParams = false;

type PageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({slug}));
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {locale: localeParam, slug} = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    return {};
  }

  const product = getProductBySlug(locale, slug);

  if (!product) {
    return {};
  }

  const title = product.seo?.title ?? product.title;
  const description = product.seo?.description ?? product.description;
  const path = `/products/${product.slug}`;
  const canonicalPath = getLocalizedPath(locale, path);
  const imageSrc = product.mainPreviewImage?.src ?? product.galleryImages?.[0]?.src ?? undefined;
  const imageAlt = product.mainPreviewImage?.alt ?? product.title;

  return {
    title,
    description,
    keywords: product.tags,
    alternates: {
      canonical: canonicalPath,
      languages: getHreflang(path),
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalPath,
      ...(imageSrc
        ? {
            images: [
              {
                url: imageSrc,
                alt: imageAlt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: imageSrc ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageSrc ? {images: [imageSrc]} : {}),
    },
  };
}

export default async function ProductPage({params}: PageProps) {
  const {locale: localeParam, slug} = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    notFound();
  }

  const product = getProductBySlug(locale, slug);
  if (!product) {
    notFound();
  }

  const products = getProducts(locale);
  const productUrl = `https://tetibetti.com/${locale}/products/${product.slug}`;
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      description: product.seo?.description ?? product.description,
      brand: {
        "@type": "Brand",
        name: "Teti Betti",
      },
      category: "Digital Product",
      url: productUrl,
    },
    ...(product.faq?.items?.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            inLanguage: locale,
            mainEntity: product.faq.items.map((item) => ({
              "@type": "Question",
              name: item.title,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
              },
            })),
          },
        ]
      : []),
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}}
      />
      <ProductPageClient product={product} allProducts={products} />
    </>
  );
}
