"use client";

import { useEffect, useMemo, useState } from "react";
import type { CommerceCartProduct } from "@/components/cart/utils";

type CommerceProductsApiResponse =
  | {
      ok: true;
      products: CommerceCartProduct[];
    }
  | {
      ok: false;
      code?: string;
      message?: string;
    };

export const useCommerceProducts = (slugs: string[] = []) => {
  const [products, setProducts] = useState<CommerceCartProduct[]>([]);
  const slugsKey = useMemo(
    () =>
      Array.from(
        new Set(
          slugs
            .map((slug) => slug.trim().toLowerCase())
            .filter((slug) => slug.length > 0),
        ),
      )
        .sort()
        .join(","),
    [slugs],
  );

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const endpoint = slugsKey
          ? `/api/products/commerce?slugs=${encodeURIComponent(slugsKey)}`
          : "/api/products/commerce";
        const response = await fetch(endpoint, {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }

        const body = (await response.json()) as CommerceProductsApiResponse;
        if (!body.ok || !Array.isArray(body.products)) {
          return;
        }

        if (isMounted) {
          setProducts(body.products);
        }
      } catch {
        // ignore lookup failures and keep static/fallback values
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [slugsKey]);

  return useMemo(() => new Map(products.map((product) => [product.slug, product])), [products]);
};
