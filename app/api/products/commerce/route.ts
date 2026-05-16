import { getAllProductSlugs } from "@/content/products";
import { getDb } from "@/lib/server/db";
import { listProductsBySlugs } from "@/lib/server/repositories/products";

const PRODUCT_SLUG_RE = /^[a-z0-9][a-z0-9-]{1,63}$/;
const MAX_SLUGS = 100;

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });

export async function GET(request: Request) {
  try {
    const db = await getDb();
    const url = new URL(request.url);
    const slugsParam = (url.searchParams.get("slugs") ?? "").trim();
    const requestedSlugs = slugsParam
      ? Array.from(
          new Set(
            slugsParam
              .split(",")
              .map((value) => value.trim().toLowerCase())
              .filter((value) => PRODUCT_SLUG_RE.test(value)),
          ),
        ).slice(0, MAX_SLUGS)
      : [];

    const slugs = requestedSlugs.length > 0 ? requestedSlugs : getAllProductSlugs();
    const products = await listProductsBySlugs(db, slugs);

    return jsonResponse({
      ok: true,
      products: products.map((product) => ({
        slug: product.slug,
        name: product.name,
        priceMinor: product.priceMinor,
        currency: product.currency,
        status: product.status,
        isActive: product.isActive,
      })),
    });
  } catch (error) {
    console.error("Products commerce lookup failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return jsonResponse(
      {
        ok: false,
        code: "PRODUCTS_COMMERCE_LOOKUP_FAILED",
        message: "Unable to load products commerce data",
      },
      500,
    );
  }
}
