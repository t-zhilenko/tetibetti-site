import type { MetadataRoute } from "next";
import {routing} from "@/i18n/routing";
import {getAllProductSlugs} from "@/content/products";

const baseUrl = "https://tetibetti.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const staticRoutes = ["/", "/products", "/shop", "/blog", "/about", "/faq", "/contact"];
  const productRoutes = getAllProductSlugs().map((slug) => `/products/${slug}`);
  const localizedRoutes = routing.locales.flatMap((locale) =>
    [...staticRoutes, ...productRoutes].map((route) => `/${locale}${route === "/" ? "" : route}`)
  );

  return localizedRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
  }));
}
