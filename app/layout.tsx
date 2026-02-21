import type { Metadata } from "next";
import { Allura, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Container from "@/components/Container";
import Link from "next/link";

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

          <footer className="border-t border-deep/10">
            <Container>
              <div className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
                <div className="flex flex-wrap gap-4">
                  <Link href="/privacy" className="hover:underline">
                    Privacy
                  </Link>
                  <Link href="/terms" className="hover:underline">
                    Terms
                  </Link>
                  <Link href="/refund" className="hover:underline">
                    Refund
                  </Link>
                </div>
                <p className="text-xs">(c) 2026 Teti Betti. All rights reserved.</p>
              </div>
            </Container>
          </footer>
        </div>
      </body>
    </html>
  );
}
