"use client";

import {useEffect, useMemo, useRef, useState} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type {ProductCardItem} from "@/components/product-card-data";
import {Link} from "@/i18n/navigation";

type ProductCarouselProps = {
  products: ProductCardItem[];
  title?: string;
  showViewAll?: boolean;
  viewAllLabel?: string;
  viewAllHref?: string;
  viewAllClassName?: string;
  className?: string;
  titleClassName?: string;
  showArrows?: boolean;
};

const arrowClassName =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfc2c0]/36 bg-white/78 text-deep/65 transition-colors hover:bg-white hover:text-deep/82 disabled:cursor-default disabled:opacity-40";

export default function ProductCarousel({
  products,
  title,
  showViewAll = false,
  viewAllLabel = "View all",
  viewAllHref = "/shop",
  viewAllClassName,
  className,
  titleClassName,
  showArrows = true,
}: ProductCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(products.length > 3);

  const hasArrows = useMemo(() => showArrows && products.length > 0, [showArrows, products.length]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const updateScrollState = () => {
      const maxScroll = viewport.scrollWidth - viewport.clientWidth;
      setCanScrollPrev(viewport.scrollLeft > 2);
      setCanScrollNext(viewport.scrollLeft < maxScroll - 2);
    };

    updateScrollState();
    viewport.addEventListener("scroll", updateScrollState, {passive: true});
    window.addEventListener("resize", updateScrollState);
    return () => {
      viewport.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [products.length]);

  const scrollByCard = (direction: "prev" | "next") => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const firstCard = viewport.querySelector<HTMLElement>("[data-card]");
    const gap = 20;
    const step = firstCard ? firstCard.offsetWidth + gap : viewport.clientWidth * 0.8;
    viewport.scrollBy({
      left: direction === "next" ? step : -step,
      behavior: "smooth",
    });
  };

  return (
    <section className={className}>
      {title || showViewAll ? (
        <div className="mb-6 flex items-center justify-between gap-4">
          {title ? (
            <h2 className={titleClassName ?? "text-[24px] leading-tight text-deep/88"}>{title}</h2>
          ) : (
            <span />
          )}
          {showViewAll ? (
            <Link
              href={viewAllHref}
              className={
                viewAllClassName ??
                "text-[12px] uppercase tracking-[0.12em] text-deep/58 transition-colors hover:text-deep/78"
              }
            >
              {viewAllLabel}
            </Link>
          ) : null}
        </div>
      ) : null}

      <div className="relative">
        {hasArrows ? (
          <div className="mb-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => scrollByCard("prev")}
              className={arrowClassName}
              disabled={!canScrollPrev}
              aria-label="Scroll products left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => scrollByCard("next")}
              className={arrowClassName}
              disabled={!canScrollNext}
              aria-label="Scroll products right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : null}

        <div
          ref={viewportRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((product) => (
            <div
              key={product.slug}
              data-card
              className="w-full shrink-0 snap-start basis-[88%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]"
            >
              <ProductCard item={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
