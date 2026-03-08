import type { Metadata } from "next";
import { Allura, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/app/providers";

const siteUrl = "https://tetibetti.com";
const siteName = "Teti Betti";
const siteDescription =
  "Minimal digital tools for thoughtful productivity. Notion templates, planners, and learning systems.";
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
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    description:
      "Digital studio creating Notion templates, planners and learning tools.",
    ...(sameAs.length ? { sameAs } : {}),
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description:
      "Digital studio creating Notion templates, planners and learning tools.",
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
    },
  },
];

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const allura = Allura({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
  weight: "400",
});

export const metadata: Metadata = {
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
  keywords: [
    "Teti Betti",
    "Notion templates",
    "digital planners",
    "productivity systems",
    "learning systems",
    "minimal tools",
  ],
  icons: {
    icon: "/fav.svg",
    shortcut: "/fav.svg",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} ${allura.variable} antialiased`}
      >
        <Providers>
          <div className="min-h-screen flex flex-col bg-soft">
            <Header />

            <main className="flex-1">
              <div>{children}</div>
            </main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
