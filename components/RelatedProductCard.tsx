import Image from "next/image";
import Link from "next/link";

type RelatedProductCardProps = {
  title: string;
  label: string;
  href: string;
  cta: string;
  imageSrc: string;
  imageAlt: string;
};

export default function RelatedProductCard({
  title,
  label,
  href,
  cta,
  imageSrc,
  imageAlt,
}: RelatedProductCardProps) {
  const isAnchor = href.startsWith("#");
  const Wrapper = isAnchor ? "a" : Link;
  const wrapperProps = { href, className: "group block h-full" };

  return (
    <div className="rounded-2xl bg-[#fbf7f6] p-4 ring-1 ring-[#cabab1]/20">
      <Wrapper {...wrapperProps}>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-[#f7dce0]/14">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 240px, 100vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.02]"
          />
        </div>
        <div className="mt-4 space-y-1">
          <p className="text-[11px] uppercase tracking-[0.24em] text-deep/45">
            {label}
          </p>
          <h3 className="text-base text-deep/85">{title}</h3>
        </div>
        <div className="mt-4">
          <span className="inline-flex items-center text-xs uppercase tracking-[0.24em] text-deep/60 group-hover:text-deep/85 transition-colors">
            {cta}
          </span>
        </div>
      </Wrapper>
    </div>
  );
}
