import type {Metadata} from "next";
import {notFound} from "next/navigation";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import EmailSubscription from "@/components/EmailSubscription";
import {getProducts} from "@/content/products";
import {resolveLocale} from "@/i18n/locale";
import {buildLocalizedPageMetadata} from "@/i18n/metadata";

type HomePageProps = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: HomePageProps): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    params,
    pathname: "/",
    namespace: "Pages.home.meta",
  });
}

export default async function HomePage({params}: HomePageProps) {
  const locale = await resolveLocale(params);

  if (!locale) {
    notFound();
  }

  const products = getProducts(locale);

  return (
    <>
      <Hero />
      <FeaturedProducts products={products} />
      <EmailSubscription />
    </>
  );
}
