"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import GalleryPlaceholder from "@/components/GalleryPlaceholder";
import { ChevronLeft, ChevronRight } from "lucide-react";

type GalleryImage = {
  src: string;
  alt: string;
  headline?: string;
  lines?: string[];
  bullets?: string[];
};

type ProductGalleryEmblaProps = {
  images: GalleryImage[];
};

export default function ProductGalleryEmbla({ images }: ProductGalleryEmblaProps) {
  const fallbackImages = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => ({
        src: "",
        alt: `Preview placeholder ${index + 1}`,
      })),
    []
  );

  const galleryImages = images.length ? images : fallbackImages;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const wasLightboxOpenRef = useRef(false);

  const [mainViewportRef, emblaMain] = useEmblaCarousel({
    loop: true,
    align: "start",
  });

  const [thumbViewportRef, emblaThumbs] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onSelect = useCallback(() => {
    if (!emblaMain) {
      return;
    }
    const index = emblaMain.selectedScrollSnap();
    setSelectedIndex(index);
    emblaThumbs?.scrollTo(index);
  }, [emblaMain, emblaThumbs]);

  useEffect(() => {
    if (!emblaMain) {
      return;
    }
    onSelect();
    emblaMain.on("select", onSelect);
    emblaMain.on("reInit", onSelect);
    return () => {
      emblaMain.off("select", onSelect);
      emblaMain.off("reInit", onSelect);
    };
  }, [emblaMain, onSelect]);

  useEffect(() => {
    if (wasLightboxOpenRef.current && !lightboxOpen && emblaMain) {
      emblaMain.scrollTo(selectedIndex, true);
      emblaThumbs?.scrollTo(selectedIndex, true);
    }
    wasLightboxOpenRef.current = lightboxOpen;
  }, [lightboxOpen, selectedIndex, emblaMain, emblaThumbs]);

  const scrollPrev = useCallback(() => emblaMain?.scrollPrev(), [emblaMain]);
  const scrollNext = useCallback(() => emblaMain?.scrollNext(), [emblaMain]);

  const slides = useMemo(
    () =>
      galleryImages.map((image) => ({
        src: image.src,
        alt: image.alt,
      })),
    [galleryImages]
  );

  const normalizeLines = (lines: string[] | undefined) => {
    if (!lines) {
      return [];
    }
    return lines
      .map((line) => line.replace(/^[\s•\-–—]+/, "").trim())
      .filter(Boolean)
      .slice(0, 2);
  };

  return (
    <div className="w-full">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#FBF3F4] shadow-[0_12px_35px_rgba(0,0,0,0.06),inset_0_0_0_1px_rgba(223,194,192,0.25)]">
        <div className="h-full overflow-hidden" ref={mainViewportRef}>
          <div className="flex h-full">
            {galleryImages.map((image, index) => {
              const overlayLines = normalizeLines(
                image.lines?.length ? image.lines : image.bullets
              );
              const showOverlay =
                Boolean(image.headline) || overlayLines.length > 0;
              return (
              <div className="flex-[0_0_100%] h-full" key={`${image.src}-${index}`}>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="relative h-full w-full cursor-zoom-in"
                  aria-label="Open image preview"
                >
                    {image.src ? (
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 560px, 92vw"
                        unoptimized
                        loading="eager"
                        className="object-contain"
                      />
                    ) : (
                    <GalleryPlaceholder className="h-full w-full" />
                  )}
                  {showOverlay ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 md:p-6">
                      <div className="rounded-2xl bg-white/80 px-4 py-3 shadow-[0_10px_30px_rgba(43,89,104,0.18)] backdrop-blur">
                        {image.headline ? (
                          <p className="text-[16px] md:text-[18px] font-medium text-deep/90 font-serif">
                            {image.headline}
                          </p>
                        ) : null}
                        {overlayLines.length ? (
                          <div className="mt-1 space-y-1 text-[12px] md:text-[13px] text-deep/60">
                            {overlayLines.map((line, lineIndex) => (
                              <p key={`${lineIndex}-${line.slice(0, 10)}`}>
                                {line}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </button>
              </div>
              );
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous image"
          className="absolute left-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dfc2c0]/35 bg-white/70 text-deep/70 shadow-sm backdrop-blur transition hover:text-deep/90"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
            <path
              d="M12.5 4.5 7.5 10l5 5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next image"
          className="absolute right-4 top-1/2 -translate-y-1/2 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dfc2c0]/35 bg-white/70 text-deep/70 shadow-sm backdrop-blur transition hover:text-deep/90"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4">
            <path
              d="m7.5 4.5 5 5.5-5 5.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      <div className="mt-3 text-sm text-deep/55 text-center">
        {selectedIndex + 1} / {galleryImages.length}
      </div>
      <div className="mt-4">
        <div className="overflow-hidden" ref={thumbViewportRef}>
          <div className="flex gap-3 px-3 py-3">
            {galleryImages.map((image, index) => {
              const isActive = index === selectedIndex;
              return (
                <button
                  key={`${image.src}-${index}-thumb`}
                  type="button"
                  onClick={() => emblaMain?.scrollTo(index)}
                  className={`relative h-14 w-20 md:h-16 md:w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#FBF3F4] transition-shadow duration-200 ${
                    isActive
                      ? "shadow-[inset_0_0_0_1px_rgba(223,194,192,0.45),0_6px_18px_rgba(0,0,0,0.06)]"
                      : "shadow-[inset_0_0_0_1px_rgba(223,194,192,0.25)] hover:shadow-[inset_0_0_0_1px_rgba(223,194,192,0.4)]"
                  }`}
                  aria-label={`Select image ${index + 1}`}
                  aria-current={isActive}
                >
                  {image.src ? (
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <GalleryPlaceholder
                      label={image.alt}
                      variant="thumb"
                      className="h-full w-full"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <Lightbox
        className="lightbox-jewelry"
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={slides}
        index={selectedIndex}
        on={{
          view: ({ index }) => {
            if (typeof index === "number") {
              setSelectedIndex(index);
            }
          },
        }}
        carousel={{ finite: false }}
        animation={{ fade: 220, swipe: 280 }}
        controller={{ closeOnPullDown: true, closeOnBackdropClick: true }}
        styles={{
          container: { backgroundColor: "rgba(0,0,0,0.60)", pointerEvents: "auto" },
          slide: { padding: "0", backgroundColor: "transparent" },
          root: { backgroundColor: "transparent" },
        }}
        render={{
          slide: ({ slide }) => (
            <div className="flex h-full w-full items-center justify-center">
              <div
                className="relative rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] overflow-hidden"
                style={{ width: "min(90vw, 90vh)", height: "min(90vw, 90vh)" }}
              >
                {slide.src ? (
                  <img
                    src={slide.src}
                    alt={slide.alt ?? ""}
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                ) : (
                  <GalleryPlaceholder className="h-full w-full" />
                )}
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
}
