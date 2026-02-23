import type { Metadata } from "next";
import { Allura, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
  title: "Teti Betti",
  description: "Teti Betti storefront UI foundation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${playfair.variable} ${allura.variable} antialiased`}
      >
        <div className="min-h-screen flex flex-col bg-soft">
          <Header />

          <main className="flex-1">
            <div>{children}</div>
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
