"use client";

import {useCallback, useEffect, useState} from "react";
import Image from "next/image";
import {ChevronLeft, ChevronRight, Send, X} from "lucide-react";
import {
  SALE_CATEGORIES,
  saleItemPhoto,
  saleTelegramLink,
  type SaleCategory,
  type SaleItem,
} from "@/content/sale";

const ctaClassName =
  "inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-deep/10 bg-blush/60 px-4 text-[13px] font-medium text-deep/80 transition-colors hover:bg-blush/70";

type Viewer = {item: SaleItem; index: number};

type SaleCatalogProps = {
  items: SaleItem[];
};

export default function SaleCatalog({items}: SaleCatalogProps) {
  const [viewer, setViewer] = useState<Viewer | null>(null);

  const close = useCallback(() => setViewer(null), []);
  const step = useCallback((delta: number) => {
    setViewer((current) => {
      if (!current) return current;
      const count = current.item.photos;
      return {...current, index: (current.index + delta + count) % count};
    });
  }, []);

  useEffect(() => {
    if (!viewer) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [viewer, close, step]);

  const [filter, setFilter] = useState<SaleCategory | "all">("all");

  const available = items.filter((item) => !item.sold);
  const sold = items.filter((item) => item.sold);
  const visibleCategories = SALE_CATEGORIES.filter((category) =>
    available.some((item) => item.category === category.key)
  );
  const shown = filter === "all" ? available : available.filter((item) => item.category === filter);

  const pillClassName = (active: boolean) =>
    `rounded-full border px-3 py-1 text-[12px] transition-colors ${
      active
        ? "border-deep/70 bg-deep/80 text-white"
        : "border-deep/20 text-deep/70 hover:border-deep/40 hover:text-deep"
    }`;

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Фільтр за категорією">
          <button type="button" onClick={() => setFilter("all")} className={pillClassName(filter === "all")}>
            Усе <span className="opacity-60">{available.length}</span>
          </button>
          {visibleCategories.map((category) => {
            const count = available.filter((item) => item.category === category.key).length;
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => setFilter(category.key)}
                className={pillClassName(filter === category.key)}
              >
                {category.label} <span className="opacity-60">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((item) => (
            <SaleCard key={item.id} item={item} onOpen={(index) => setViewer({item, index})} />
          ))}
        </div>

        {sold.length > 0 && filter === "all" && (
          <section className="space-y-5">
            <h2 className="text-xl md:text-2xl leading-tight text-deep/60">Уже продано</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sold.map((item) => (
                <SaleCard key={item.id} item={item} onOpen={(index) => setViewer({item, index})} />
              ))}
            </div>
          </section>
        )}
      </div>

      {viewer && (
        <div
          className="fixed inset-0 z-[80] flex flex-col bg-[#1c2a30]/95 text-white"
          role="dialog"
          aria-modal="true"
          aria-label={viewer.item.title}
          onClick={close}
        >
          <div className="flex items-center justify-between px-4 py-3 text-[13px]">
            <p className="truncate pr-4 text-white/80">
              №{viewer.item.id} · {viewer.item.title}
              <span className="ml-3 text-white/50">
                {viewer.index + 1} / {viewer.item.photos}
              </span>
            </p>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              aria-label="Закрити"
            >
              <X size={18} />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-2 md:px-16">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                step(-1);
              }}
              className="absolute left-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 md:left-4"
              aria-label="Попереднє фото"
            >
              <ChevronLeft size={22} />
            </button>
            <Image
              key={`${viewer.item.id}-${viewer.index}`}
              src={saleItemPhoto(viewer.item, viewer.index + 1)}
              alt={`${viewer.item.title}, фото ${viewer.index + 1}`}
              width={960}
              height={1280}
              unoptimized
              priority
              className="max-h-[calc(100vh-150px)] w-auto max-w-full rounded-[10px] object-contain"
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
            />
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
              className="absolute right-2 top-1/2 z-10 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 md:right-4"
              aria-label="Наступне фото"
            >
              <ChevronRight size={22} />
            </button>
          </div>

          <div
            className="flex gap-2 overflow-x-auto px-4 py-3"
            onClick={(event) => event.stopPropagation()}
          >
            {Array.from({length: viewer.item.photos}, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setViewer({item: viewer.item, index})}
                className={`h-14 w-11 shrink-0 overflow-hidden rounded-[6px] border-2 ${
                  index === viewer.index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                }`}
                aria-label={`Фото ${index + 1}`}
              >
                <Image
                  src={saleItemPhoto(viewer.item, index + 1, true)}
                  alt=""
                  width={44}
                  height={56}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

type SaleCardProps = {
  item: SaleItem;
  onOpen: (index: number) => void;
};

function SaleCard({item, onOpen}: SaleCardProps) {
  return (
    <article
      className={`flex h-full flex-col rounded-[22px] border border-[#dfc2c0]/28 bg-[#fdfcfa] p-4 shadow-[0_12px_28px_rgba(223,194,192,0.2)] ${
        item.sold ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => onOpen(0)}
        className="group relative block w-full overflow-hidden rounded-[16px] border border-[#dfc2c0]/22 bg-[#f8f6f5]"
        aria-label={`Фото: ${item.title}`}
      >
        <Image
          src={saleItemPhoto(item, 1, true)}
          alt={item.title}
          width={560}
          height={747}
          unoptimized
          loading="lazy"
          className="aspect-[3/4] w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-2 right-2 rounded-full bg-[#1c2a30]/70 px-2.5 py-1 text-[11px] font-medium text-white">
          {item.photos} фото
        </span>
        {item.sold && (
          <span className="absolute left-2 top-2 rounded-full bg-[#1c2a30]/80 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
            Продано
          </span>
        )}
      </button>

      <div className="mt-4 flex flex-1 flex-col gap-2">
        <p className="text-[11px] uppercase tracking-[0.2em] text-deep/40">№{item.id}</p>
        <h3 className="text-[17px] leading-snug text-deep/88">{item.title}</h3>
        <p className="text-[13px] text-deep/60">
          Розмір: <span className="text-deep/80">{item.size}</span>
        </p>
        <p className="text-[13px] leading-relaxed text-deep/68">{item.description}</p>
        <div className="mt-auto flex items-end justify-between pt-3">
          <p className="text-[22px] leading-none text-deep/90">
            {item.price} <span className="text-[13px] text-deep/60">грн</span>
          </p>
          <button
            type="button"
            onClick={() => onOpen(0)}
            className="text-[12px] text-deep/50 underline-offset-4 hover:text-deep hover:underline"
          >
            усі фото
          </button>
        </div>
        {!item.sold && (
          <a
            href={saleTelegramLink(item)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ctaClassName} mt-2`}
          >
            <Send size={15} />
            Написати в Telegram
          </a>
        )}
      </div>
    </article>
  );
}
