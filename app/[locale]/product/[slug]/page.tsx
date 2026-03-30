import {hasLocale} from "next-intl";
import {redirect} from "next/navigation";
import {getAllProductSlugs} from "@/content/products";
import {routing} from "@/i18n/routing";

export const dynamicParams = false;

type ProductRedirectPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const legacySlugMap: Record<string, string> = {
  "nutrition-system": "nutrition-meal-planner",
};

export function generateStaticParams() {
  const legacySlugs = Object.keys(legacySlugMap);
  const productSlugs = getAllProductSlugs();
  return Array.from(new Set([...legacySlugs, ...productSlugs])).map((slug) => ({
    slug,
  }));
}

export default async function ProductRedirectPage({params}: ProductRedirectPageProps) {
  const {locale, slug} = await params;
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const targetSlug = legacySlugMap[slug] ?? slug;
  redirect(`/${safeLocale}/products/${targetSlug}`);
}
