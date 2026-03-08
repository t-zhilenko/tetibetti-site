import type { Metadata } from "next";
import ShopPage from "@/app/shop/page";

const description =
  "Browse calm, minimal Notion templates and digital planners from Teti Betti.";

export const metadata: Metadata = {
  title: "Products",
  description,
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Products",
    description,
    url: "/products",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Products",
    description,
  },
};

export default function ProductsPage() {
  return <ShopPage />;
}
