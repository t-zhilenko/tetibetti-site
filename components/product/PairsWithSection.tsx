import Image from "next/image";
import {useTranslations} from "next-intl";
import Container from "@/components/Container";
import {Link} from "@/i18n/navigation";

const placeholderSvg = encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f7dce0" stop-opacity="0.55"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0.85"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="18" fill="url(#g)"/>
    <rect x="22" y="28" width="52" height="32" rx="10" fill="rgba(223,194,192,0.35)"/>
  </svg>
`);
const placeholderSrc = `data:image/svg+xml;utf8,${placeholderSvg}`;

type PairsWithItem = {
  title: string;
  subtitle: string;
  href: string;
  imageSrc?: string | null;
  imageAlt?: string;
};

type PairsWithSectionProps = {
  title: string;
  items: PairsWithItem[];
};

function PairsWithCard({
  title,
  subtitle,
  href,
  imageSrc,
  imageAlt,
}: PairsWithItem) {
  const t = useTranslations("Product");
  const isAnchor = href.startsWith("#");
  const Wrapper = isAnchor ? "a" : Link;
  const wrapperProps = {
    href,
    "aria-label": t("viewProductAria", {title}),
    className:
      "group flex items-center gap-3 rounded-2xl border border-[#dfc2c0]/25 bg-[#f7dce0]/20 px-4 py-3 transition-transform duration-200 hover:scale-[1.02] hover:bg-[#f7dce0]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(223,194,192,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9]",
  };

  return (
    <Wrapper {...wrapperProps}>
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-[#dfc2c0]/35 bg-white/70">
        <Image
          src={imageSrc ?? placeholderSrc}
          alt={imageAlt ?? title}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-deep/85 transition">
          {title}
        </p>
        <p className="text-[12px] text-deep/55">{subtitle}</p>
      </div>
      <span
        aria-hidden="true"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#dfc2c0]/30 bg-white/70 text-deep/45 transition-transform duration-200 group-hover:translate-x-1"
      >
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5">
          <path
            d="m7.5 4.5 5 5.5-5 5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </Wrapper>
  );
}

export default function PairsWithSection({
  title,
  items,
}: PairsWithSectionProps) {
  const content = (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep/55 opacity-80">
        {title}
      </p>
      <div className="mt-3 space-y-3">
        {items.map((item) => (
          <PairsWithCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-0 bg-[#fdf9f9]">
      <Container className="!px-0">
        <div className="max-w-3xl text-left">{content}</div>
      </Container>
    </section>
  );
}
