"use client";

import { useState } from "react";
import Image from "next/image";
import {useTranslations} from "next-intl";
import ScreenshotFrame from "@/components/ScreenshotFrame";

type ProductImage = {
  src: string;
  alt?: string;
};

type ProductGalleryProps = {
  images?: ProductImage[];
  title: string;
};

export default function ProductGallery({ images = [], title }: ProductGalleryProps) {
  const t = useTranslations("Product.gallery");
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-4">
      {activeImage?.src ? (
        <ScreenshotFrame
          variant="hero"
          src={activeImage.src}
          alt={activeImage.alt || title}
          priority
          sizes="(min-width: 1024px) 520px, 90vw"
          objectPosition="55% 60%"
        />
      ) : (
        <div className="aspect-[16/10] rounded-3xl bg-[radial-gradient(circle_at_top,#f7dce0_0%,#fbf7f6_55%,#fdf9f9_100%)] text-deep/50 text-sm flex items-center justify-center">
          {t("placeholderMain")}
        </div>
      )}
      {images.length > 1 ? (
        <div className="flex flex-wrap items-center gap-3">
          {images.map((image, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${image.src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-16 w-16 rounded-xl border transition-all duration-200 overflow-hidden ${
                  isActive
                    ? "border-[#2b5968]/40 ring-2 ring-[#dfc2c0]/60"
                    : "border-[#cabab1]/40 hover:border-[#2b5968]/30"
                }`}
                aria-label={t("viewImage", {index: index + 1, total: images.length})}
              >
                {image.src ? (
                  <Image
                    src={image.src}
                    alt={image.alt || title}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[#f7dce0]/40" aria-hidden />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
