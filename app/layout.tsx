import "./globals.css";
import {getLocale} from "next-intl/server";
import {Allura, Inter, Playfair_Display} from "next/font/google";
import {toValidLocale} from "@/i18n/locale";

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

type RootLayoutProps = {
  children: React.ReactNode;
};

export default async function RootLayout({children}: RootLayoutProps) {
  const locale = toValidLocale(await getLocale()) ?? "en";

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${playfair.variable} ${allura.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
