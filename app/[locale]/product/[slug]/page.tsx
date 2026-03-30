import {redirect} from "next/navigation";
import {toValidLocale} from "@/i18n/locale";
import {routing} from "@/i18n/routing";

export const runtime = "edge";

type ProductRedirectPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

const legacySlugMap: Record<string, string> = {
  "nutrition-system": "nutrition-meal-planner",
};

export default async function ProductRedirectPage({params}: ProductRedirectPageProps) {
  const {locale, slug} = await params;
  const safeLocale = toValidLocale(locale) ?? routing.defaultLocale;
  const targetSlug = legacySlugMap[slug] ?? slug;
  redirect(`/${safeLocale}/products/${targetSlug}`);
}
