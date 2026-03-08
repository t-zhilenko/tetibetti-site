"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import GalleryPlaceholder from "@/components/GalleryPlaceholder";

type CarouselImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

type ProductGalleryProps = {
  images: CarouselImage[];
};

export default function ProductGalleryCarousel({ images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fallbackImages: CarouselImage[] = Array.from({ length: 5 }, (_, index) => ({
    src: "",
    alt: `Preview placeholder ${index + 1}`,
  }));

  const safeImages = images.length ? images : fallbackImages;
  const totalImages = safeImages.length;
  const activeImage = safeImages[activeIndex] ?? safeImages[0];
  const hasMultiple = totalImages > 1;

  const goPrev = () => {
    if (!hasMultiple) {
      return;
    }
    setActiveIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const goNext = () => {
    if (!hasMultiple) {
      return;
    }
    setActiveIndex((prev) => (prev + 1) % totalImages);
  };

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  return (
    <div className="w-full max-w-[350px] sm:max-w-[420px] lg:max-w-[560px] mx-auto">
      <div className="relative rounded-3xl bg-[linear-gradient(135deg,rgba(247,220,224,0.45),rgba(255,255,255,0.9))] p-[10px] shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="relative block w-full overflow-hidden rounded-[20px] bg-white/60"
          aria-label="Open image preview"
        >
          <div className="relative w-full aspect-square">
            {activeImage?.src ? (
              <Image
                src={activeImage.src}
                alt={activeImage.alt}
                fill
                priority={activeIndex === 0}
                sizes="(min-width: 1024px) 560px, (min-width: 640px) 420px, 90vw"
                className="object-cover"
                style={{ objectPosition: activeImage.objectPosition ?? "50% 50%" }}
              />
            ) : (
              <GalleryPlaceholder className="h-full w-full" />
            )}
          </div>
        </button>
        {hasMultiple ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-[#dfc2c0]/35 bg-white/70 text-deep/70 shadow-sm backdrop-blur transition hover:text-deep/90"
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="h-[18px] w-[18px]"
              >
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
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-[#dfc2c0]/35 bg-white/70 text-deep/70 shadow-sm backdrop-blur transition hover:text-deep/90"
            >
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="h-[18px] w-[18px]"
              >
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
          </>
        ) : null}
      </div>
      <div className="mt-3 text-sm text-deep/55 text-center">
        {activeIndex + 1} / {totalImages}
      </div>
      {hasMultiple ? (
        <div className="mt-4 hidden lg:flex items-center gap-3 overflow-x-auto px-3 py-2">
          {safeImages.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${image.src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-lg bg-white/70 transition-all duration-200 ${
                  isActive
                    ? "shadow-[inset_0_0_0_1px_rgba(223,194,192,0.55),0_6px_18px_rgba(0,0,0,0.06)]"
                    : "shadow-[inset_0_0_0_1px_rgba(223,194,192,0.35)] hover:shadow-[inset_0_0_0_1px_rgba(223,194,192,0.55)]"
                }`}
                aria-label={`View image ${index + 1} of ${totalImages}`}
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
      ) : null}
      {isLightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-10 right-0 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/80 transition hover:text-white"
              aria-label="Close preview"
            >
              Close
            </button>
            <div className="rounded-2xl bg-white p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#f7f3f3]">
                {activeImage?.src ? (
                  <Image
                    src={activeImage.src}
                    alt={activeImage.alt}
                    fill
                    sizes="(min-width: 1024px) 900px, 90vw"
                    className="object-contain"
                  />
                ) : (
                  <GalleryPlaceholder className="h-full w-full" />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
