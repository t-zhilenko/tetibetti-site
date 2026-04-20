import type { PaidProductConfig } from "@/config/products";
import type { Product } from "@/lib/payments/types";
import { isProductStatus } from "@/lib/payments/product-helpers";
import type { D1Database } from "@/lib/server/d1";

type ProductRow = {
  id: number;
  slug: string;
  name: string;
  price_minor: number;
  currency: string;
  is_active: number;
  status: string;
  delivery_type: string;
  target_url: string | null;
  created_at: string;
  updated_at: string;
};

const mapProductRow = (row: ProductRow): Product => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  priceMinor: row.price_minor,
  currency: row.currency,
  isActive: row.is_active === 1,
  status: isProductStatus(row.status) ? row.status : "archived",
  deliveryType: row.delivery_type,
  targetUrl: row.target_url,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listProductsBySlugs = async (
  db: D1Database,
  slugs: readonly string[],
): Promise<Product[]> => {
  if (slugs.length === 0) {
    return [];
  }

  const placeholders = slugs.map(() => "?").join(", ");
  const result = await db
    .prepare(
      `
        SELECT
          id,
          slug,
          name,
          price_minor,
          currency,
          is_active,
          status,
          delivery_type,
          target_url,
          created_at,
          updated_at
        FROM products
        WHERE slug IN (${placeholders})
      `,
    )
    .bind(...slugs)
    .all<ProductRow>();

  const rows = result.results ?? [];
  const productsBySlug = new Map(rows.map((row) => [row.slug, mapProductRow(row)]));

  return slugs
    .map((slug) => productsBySlug.get(slug))
    .filter((product): product is Product => Boolean(product));
};

export const getProductBySlug = async (
  db: D1Database,
  slug: string,
): Promise<Product | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          slug,
          name,
          price_minor,
          currency,
          is_active,
          status,
          delivery_type,
          target_url,
          created_at,
          updated_at
        FROM products
        WHERE slug = ?
        LIMIT 1
      `,
    )
    .bind(slug)
    .first<ProductRow>();

  return row ? mapProductRow(row) : null;
};

export const getProductById = async (
  db: D1Database,
  id: number,
): Promise<Product | null> => {
  const row = await db
    .prepare(
      `
        SELECT
          id,
          slug,
          name,
          price_minor,
          currency,
          is_active,
          status,
          delivery_type,
          target_url,
          created_at,
          updated_at
        FROM products
        WHERE id = ?
        LIMIT 1
      `,
    )
    .bind(id)
    .first<ProductRow>();

  return row ? mapProductRow(row) : null;
};

export const upsertProductFromConfig = async (
  db: D1Database,
  config: PaidProductConfig,
): Promise<Product> => {
  await db
    .prepare(
      `
        INSERT INTO products (slug, name, price_minor, currency, is_active, status, delivery_type, target_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(slug) DO UPDATE SET
          name = excluded.name,
          price_minor = excluded.price_minor,
          currency = excluded.currency,
          is_active = excluded.is_active,
          status = excluded.status,
          delivery_type = excluded.delivery_type,
          target_url = excluded.target_url,
          updated_at = CURRENT_TIMESTAMP
      `,
    )
    .bind(
      config.slug,
      config.name,
      config.priceMinor,
      config.currency,
      config.isActive ? 1 : 0,
      config.status,
      config.deliveryType,
      config.targetUrl,
    )
    .run();

  const product = await getProductBySlug(db, config.slug);
  if (!product) {
    throw new Error(`Unable to load product after upsert: ${config.slug}`);
  }

  return product;
};
