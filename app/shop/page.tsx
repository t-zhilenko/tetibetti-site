"use client";

import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function ShopPage() {
  return (
    <section className="bg-[#fbf3f4]">
      <Container className="py-24 md:py-20">
        <div>
          <div className="grid gap-12 md:grid-cols-2 md:gap-10 lg:grid-cols-3 lg:gap-12">
            {products.map((product) => (
              <div key={product.slug} className="mx-auto w-full max-w-[340px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
