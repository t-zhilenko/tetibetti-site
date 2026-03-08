import type { Metadata } from "next";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import EmailSubscription from "@/components/EmailSubscription";

const description =
  "Minimal digital tools for thoughtful productivity. Notion templates, planners, and learning systems.";

export const metadata: Metadata = {
  title: "Teti Betti",
  description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Teti Betti",
    description,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Teti Betti",
    description,
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProducts />
      <EmailSubscription />
    </>
  );
}
