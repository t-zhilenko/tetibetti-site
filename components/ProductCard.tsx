import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/products";

type ProductCardProps = {
  product: Product;
};

const primaryButtonClassName =
  "inline-flex items-center justify-center rounded-full bg-blush/60 px-4 py-1.5 text-[12px] font-medium text-deep/80 border border-deep/10";
const secondaryButtonClassName =
  "inline-flex items-center justify-center rounded-full bg-transparent px-4 py-1.5 text-[12px] font-medium text-deep/45 border border-deep/15";

const PlaceholderImage = ({ title }: { title: string }) => {
  return (
    <div className="h-full w-full rounded-[12px] bg-blush/20 flex items-center justify-center">
      <div className="px-6 text-center text-xs uppercase tracking-[0.24em] text-deep/25">
        {title}
      </div>
    </div>
  );
};

export default function ProductCard({ product }: ProductCardProps) {
  const productHref = `/products/${product.slug}`;
  const checkoutHref = `/checkout?product=${product.slug}`;
  const baseImage = product.mainPreviewImage;
  const hoverImage = product.galleryImages?.[0];
  const hasImage = Boolean(baseImage?.src);
  const hasHoverImage = Boolean(hoverImage?.src);
  const isAvailable = product.status === "available";

  const cardShadow = isAvailable
    ? "shadow-[0_12px_28px_rgba(223,194,192,0.28)]"
    : "shadow-[0_8px_20px_rgba(223,194,192,0.15)]";
  const cardHover = isAvailable
    ? "motion-safe:transition-[transform,box-shadow] motion-safe:duration-[220ms] motion-safe:ease-out hover:-translate-y-[5px] hover:shadow-[0_18px_40px_rgba(223,194,192,0.38)]"
    : "motion-safe:transition-[transform,box-shadow] motion-safe:duration-[220ms] motion-safe:ease-out hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(223,194,192,0.22)]";
  const cardTone = isAvailable ? "" : "opacity-[0.92]";
  const titleClassName = isAvailable
    ? "text-[17px] leading-snug text-deep"
    : "text-[17px] leading-snug text-deep/85";
  const descriptionClassName = isAvailable
    ? "text-[13px] leading-relaxed text-deep/85"
    : "text-[13px] leading-relaxed text-deep/70";
  const priceClassName = isAvailable
    ? "text-[13px] font-medium text-deep/65"
    : "text-[13px] font-medium text-deep/50";

  return (
    <article
      className={`flex h-full flex-col rounded-[16px] bg-[#fdfcfa] p-5 ${cardShadow} ${cardHover} ${cardTone}`}
    >
      <div className="flex h-full flex-col space-y-6">
        <Link
          href={productHref}
          className="group block w-full"
          aria-label={`${product.title} details`}
        >
          {hasImage ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-[12px]">
              <Image
                src={baseImage.src}
                alt={baseImage.alt ?? product.title}
                fill
                sizes="(min-width: 1024px) 320px, (min-width: 768px) 280px, 90vw"
                className={`object-contain transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                  hasHoverImage
                    ? "opacity-100 group-hover:opacity-0 group-focus-visible:opacity-0"
                    : "opacity-100"
                }`}
              />
              {hasHoverImage ? (
                <Image
                  src={hoverImage!.src}
                  alt={hoverImage!.alt ?? product.title}
                  fill
                  sizes="(min-width: 1024px) 320px, (min-width: 768px) 280px, 90vw"
                  className="object-contain opacity-0 transition-opacity duration-300 ease-out motion-reduce:transition-none group-hover:opacity-100 group-focus-visible:opacity-100"
                />
              ) : null}
            </div>
          ) : (
            <div className="relative aspect-square w-full overflow-hidden rounded-[12px]">
              <PlaceholderImage title={product.title} />
            </div>
          )}
        </Link>
        <div className="space-y-3">
          <Link href={productHref} className="inline-flex">
            <h3 className={titleClassName}>{product.title}</h3>
          </Link>
          <p className={descriptionClassName}>{product.shortDescription}</p>
        </div>
        <div className="space-y-2">
          <p className={priceClassName}>{product.priceLabel}</p>
          {product.status === "waiting" && product.eta ? (
            <p className="text-[11px] text-deep/35">{product.eta}</p>
          ) : null}
          {product.status === "available" ? (
            <Link href={checkoutHref} className={primaryButtonClassName}>
              {product.cta}
            </Link>
          ) : (
            <button
              type="button"
              className={`${secondaryButtonClassName} cursor-not-allowed`}
              disabled
              aria-disabled="true"
            >
              {product.cta}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
