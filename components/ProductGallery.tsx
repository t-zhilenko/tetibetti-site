"use client";

import { useState } from "react";

type ProductImage = {
  src: string;
  alt?: string;
};

type ProductGalleryProps = {
  images?: ProductImage[];
  title: string;
};

export default function ProductGallery({ images = [], title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="aspect-[4/5] rounded-2xl border border-[#cabab1]/40 bg-[#fbf7f6] overflow-hidden">
        {activeImage?.src ? (
          <img
            src={activeImage.src}
            alt={activeImage.alt || title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-[radial-gradient(circle_at_top,#f7dce0_0%,#fbf7f6_55%,#fdf9f9_100%)] text-deep/50 text-sm">
            Product preview
          </div>
        )}
      </div>
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
                aria-label={`View image ${index + 1} of ${images.length}`}
              >
                <img
                  src={image.src}
                  alt={image.alt || title}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
