import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

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

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

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
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-deep/10">
            <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
              <Link href="/" className="text-xl font-semibold tracking-wide">
                Teti Betti
              </Link>
              <nav className="flex flex-wrap items-center gap-4 text-sm">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="hover:underline">
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="text-xs uppercase tracking-widest border border-deep/30 rounded px-2 py-1">
                UK / EN
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
          </main>

          <footer className="border-t border-deep/10">
            <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
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
          </footer>
        </div>
      </body>
    </html>
  );
}
