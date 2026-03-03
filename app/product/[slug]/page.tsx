import { redirect } from "next/navigation";
import { products } from "@/content/products";

export const dynamicParams = false;

type ProductRedirectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const legacySlugMap: Record<string, string> = {
  "nutrition-system": "nutrition-meal-planner",
};

export function generateStaticParams() {
  const legacySlugs = Object.keys(legacySlugMap);
  const productSlugs = products.map((product) => product.slug);
  return Array.from(new Set([...legacySlugs, ...productSlugs])).map((slug) => ({
    slug,
  }));
}

export default async function ProductRedirectPage({ params }: ProductRedirectPageProps) {
  const { slug } = await params;
  const targetSlug = legacySlugMap[slug] ?? slug;
  redirect(`/products/${targetSlug}`);
}
