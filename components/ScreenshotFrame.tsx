import Image from "next/image";

type ScreenshotFrameProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  variant?: "section" | "hero";
  objectPosition?: string;
};

export default function ScreenshotFrame({
  src,
  alt,
  priority = false,
  sizes,
  variant = "section",
  objectPosition,
}: ScreenshotFrameProps) {
  const isHero = variant === "hero";
  const resolvedSizes =
    sizes ?? (isHero ? "(min-width: 1024px) 520px, 90vw" : "(min-width: 1024px) 520px, 100vw");

  if (isHero) {
    return (
      <div className="rounded-3xl overflow-hidden bg-[#f7dce0]/14 shadow-[0_16px_36px_rgba(43,89,104,0.08)] ring-1 ring-[#2b5968]/5 transition-transform duration-200 hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes={resolvedSizes}
            className="object-cover"
            style={{ objectPosition: objectPosition ?? "55% 60%" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#fbf7f6] shadow-[0_12px_24px_rgba(43,89,104,0.06)] overflow-hidden">
      <div className="relative h-[320px] md:h-[420px] max-h-[420px] w-full">
        <div className="absolute inset-0 p-6 md:p-8">
          <div className="relative h-full w-full">
            <Image
              src={src}
              alt={alt}
              fill
              priority={priority}
              sizes={resolvedSizes}
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
