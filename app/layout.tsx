import "./globals.css";
import type {Metadata} from "next";
import {Allura, Inter, Playfair_Display} from "next/font/google";

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
  other: {
    "p:domain_verify": "5f59ad93a03591fee887eb031e02fbad",
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({children}: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${allura.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
