import type {Metadata} from "next";
import CheckoutPageClient from "@/components/checkout/CheckoutPageClient";
import {resolveLocale} from "@/i18n/locale";
import {buildLocalizedPageMetadata} from "@/i18n/metadata";

type CheckoutPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{product?: string}>;
};

export async function generateMetadata({params}: CheckoutPageProps): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    params,
    pathname: "/checkout",
    namespace: "Pages.checkout.meta",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  });
}

export default async function CheckoutPage({params, searchParams}: CheckoutPageProps) {
  const locale = await resolveLocale(params);
  if (!locale) {
    return null;
  }

  const query = await searchParams;
  return <CheckoutPageClient initialProduct={query.product} />;
}
