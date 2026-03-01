"use client";

import Container from "@/components/Container";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";

export default function ShopPage() {
  return (
    <section className="bg-[#fbf3f4]">
      <Container className="py-24 md:py-20">
        <div className="space-y-3 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-deep/50">Shop</p>
          <h1 className="text-2xl md:text-3xl text-deep/90">
            Simple tools for steady progress.
          </h1>
          <p className="mx-auto max-w-xl text-[13px] text-deep/70">
            A minimal collection of systems built for clarity and calm.
          </p>
        </div>
        <div className="mt-16">
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
