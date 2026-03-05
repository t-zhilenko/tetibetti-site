import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPageClient from "@/components/product/ProductPageClient";
import { getProductBySlug, products } from "@/content/products";

export const dynamicParams = false;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return {};
  }

  const description =
    product.seo?.description ??
    (typeof product.description === "string"
      ? product.description
      : product.shortDescription);

  return {
    title: product.seo?.title ?? product.title,
    description,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductPageClient slug={slug} />;
}
