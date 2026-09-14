"use client";

import {useEffect, useRef, useState} from "react";
import Image from "next/image";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {Link} from "@/i18n/navigation";
import {saleItemPhoto, type SaleItem} from "@/content/sale";

type SaleCarouselProps = {
  items: SaleItem[];
  ctaLabel: string;
};

const arrowClassName =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dfc2c0]/36 bg-white/78 text-deep/65 transition-colors hover:bg-white hover:text-deep/82 disabled:cursor-default disabled:opacity-40";

const ctaClassName =
  "inline-flex h-10 w-full items-center justify-center rounded-full border border-deep/10 bg-blush/60 px-4 text-[13px] font-medium text-deep/80 transition-colors hover:bg-blush/70";

export default function SaleCarousel({items, ctaLabel}: SaleCarouselProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(items.length > 3);

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
  }, [items.length]);

  const scrollByCard = (direction: "prev" | "next") => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }
    const firstCard = viewport.querySelector<HTMLElement>("[data-card]");
    const gap = 20;
    const step = firstCard ? firstCard.offsetWidth + gap : viewport.clientWidth * 0.8;
    viewport.scrollBy({left: direction === "next" ? step : -step, behavior: "smooth"});
  };

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard("prev")}
          className={arrowClassName}
          disabled={!canScrollPrev}
          aria-label="Попередні речі"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard("next")}
          className={arrowClassName}
          disabled={!canScrollNext}
          aria-label="Наступні речі"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div
        ref={viewportRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => (
          <div
            key={item.id}
            data-card
            className="w-full shrink-0 snap-start basis-[88%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]"
          >
            <article className="flex h-full flex-col rounded-[22px] border border-[#dfc2c0]/28 bg-[#fdfcfa] p-5 shadow-[0_12px_28px_rgba(223,194,192,0.2)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[3px] hover:shadow-[0_18px_34px_rgba(223,194,192,0.26)]">
              <Link href="/rozprodazh" className="group block w-full">
                <div className="relative aspect-square w-full overflow-hidden rounded-[16px] border border-[#dfc2c0]/22 bg-[#f8f6f5]">
                  <Image
                    src={saleItemPhoto(item, 1, true)}
                    alt={item.title}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                  />
                </div>
              </Link>
              <div className="mt-5 flex flex-1 flex-col gap-2">
                <Link href="/rozprodazh" className="inline-flex">
                  <h3 className="text-[17px] leading-snug text-deep/88">{item.title}</h3>
                </Link>
                <p className="text-[13px] leading-relaxed text-deep/68">Розмір {item.size}</p>
                <div className="mt-auto space-y-3 pt-2">
                  <p className="text-[13px] text-deep/60">{item.price} грн</p>
                  <Link href="/rozprodazh" className={ctaClassName}>
                    {ctaLabel}
                  </Link>
                </div>
              </div>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
