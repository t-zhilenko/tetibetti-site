import type { MetadataRoute } from "next";
import { products } from "@/content/products";

const baseUrl = "https://tetibetti.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticRoutes = ["/", "/products", "/shop", "/blog"];
  const productRoutes = products.map((product) => `/products/${product.slug}`);

  return [...staticRoutes, ...productRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
  }));
}
