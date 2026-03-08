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

  const title = product.seo?.title ?? product.title;
  const description = product.seo?.description ?? product.description;
  const canonical = `/products/${product.slug}`;
  const imageSrc =
    product.mainPreviewImage?.src ?? product.galleryImages?.[0]?.src ?? undefined;
  const imageAlt = product.mainPreviewImage?.alt ?? product.title;

  return {
    title,
    description,
    keywords: product.tags,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonical,
      ...(imageSrc
        ? {
            images: [
              {
                url: imageSrc,
                alt: imageAlt,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: imageSrc ? "summary_large_image" : "summary",
      title,
      description,
      ...(imageSrc ? { images: [imageSrc] } : {}),
    },
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
