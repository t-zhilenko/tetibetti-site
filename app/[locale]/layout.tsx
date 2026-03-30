import type { Metadata } from "next";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/app/providers";
import {toValidLocale} from "@/i18n/locale";
import { routing } from "@/i18n/routing";

const siteUrl = "https://tetibetti.com";
const ogImage = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "Teti Betti digital studio",
};

const sameAs = [
  process.env.NEXT_PUBLIC_INSTAGRAM_URL,
  process.env.NEXT_PUBLIC_YOUTUBE_URL,
  process.env.NEXT_PUBLIC_PINTEREST_URL,
  process.env.NEXT_PUBLIC_TELEGRAM_URL,
  process.env.NEXT_PUBLIC_PATREON_URL,
].filter(Boolean) as string[];

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocaleLayoutProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteName = t("siteName");
  const siteDescription = t("siteDescription");
  const languages = {
    en: "/en",
    uk: "/uk",
    "x-default": "/en",
  };

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    applicationName: siteName,
    authors: [{ name: siteName, url: siteUrl }],
    creator: siteName,
    publisher: siteName,
    category: "Productivity",
    keywords: t.raw("keywords") as string[],
    alternates: {
      canonical: `/${locale}`,
      languages,
    },
    icons: {
      icon: [
        { url: "/fav.svg", type: "image/svg+xml" },
        { url: "/favicon.ico", sizes: "any" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      locale: locale === "uk" ? "uk_UA" : "en_US",
      url: `/${locale}`,
      siteName,
      title: siteName,
      description: siteDescription,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
      images: [ogImage.url],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    notFound();
  }

  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteName = t("siteName");
  const organizationDescription = t("organizationDescription");
  const messages = await getMessages({ locale });

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      description: organizationDescription,
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      description: organizationDescription,
      inLanguage: locale,
      publisher: {
        "@type": "Organization",
        name: siteName,
        url: siteUrl,
      },
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen">
        <Suspense fallback={null}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Providers>
              <div className="min-h-screen flex flex-col bg-soft">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </Providers>
          </NextIntlClientProvider>
        </Suspense>
      </div>
    </>
  );
}
