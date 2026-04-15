"use client";

import Image from "next/image";
import {ArrowRight} from "lucide-react";
import {Link} from "@/i18n/navigation";

type EmptyCartCarouselProps = {
  onNavigate?: () => void;
};

type EmptyCartItem = {
  slug: string;
  title: string;
  imageSrc: string;
};

const curatedItems: EmptyCartItem[] = [
  {
    slug: "body-and-nutrition-tracker",
    title: "Body & Nutrition Tracker",
    imageSrc: "/images/body-and-nutrition-tracker/1.jpg",
  },
  {
    slug: "yearly-goals",
    title: "Yearly Goals System",
    imageSrc: "/images/yearly-goals/main-preview.jpg",
  },
  {
    slug: "nutrition-meal-planner",
    title: "Nutrition Meal Planner",
    imageSrc: "/images/nutrition-meal-planner/main-preview.jpg",
  },
];

export default function EmptyCartCarousel({onNavigate}: EmptyCartCarouselProps) {
  return (
    <>
      <h3 className="font-serif text-[30px] leading-[1.08] text-deep/88">
        Your cart is currently empty.
      </h3>
      <p className="mt-5 text-[14px] leading-relaxed text-deep/58">
        Not sure where to start?
        <br />
        Try these:
      </p>

      <div className="mt-8 space-y-4">
        {curatedItems.map((item, index) => {
          const isPrimary = index === 0;
          const cardClassName = isPrimary
            ? "group rounded-[22px] border border-[#dfc2c0]/34 bg-[#fdf6f4] p-5 transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#d7b8b5]/55 hover:shadow-[0_6px_14px_rgba(43,89,104,0.06)]"
            : "group rounded-[22px] border border-[#dfc2c0]/26 bg-white/92 p-4 transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#dfc2c0]/48 hover:shadow-[0_5px_12px_rgba(43,89,104,0.05)]";
          const imageSize = 74;

          return (
            <Link
              key={item.slug}
              href={`/products/${item.slug}`}
              onClick={onNavigate}
              className={`${cardClassName} flex w-full items-center gap-4 overflow-hidden`}
            >
              <div
                className="shrink-0 overflow-hidden rounded-[16px] border border-[#dfc2c0]/24 bg-[#f8f6f5]"
                style={{width: imageSize, height: imageSize}}
              >
                <Image
                  src={item.imageSrc}
                  alt={item.title}
                  width={imageSize}
                  height={imageSize}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-deep/84">{item.title}</p>
              </div>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#8fb8b3]/45 bg-[#a5c8c3]/42 text-[#2b5968]/80 transition-all duration-200 group-hover:scale-105 group-hover:bg-[#8db8b3]/62 group-hover:text-[#244d58]">
                <ArrowRight size={16} />
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
