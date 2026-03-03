import Image from "next/image";
import Link from "next/link";
import Container from "@/components/Container";

type PairsWithItem = {
  title: string;
  subtitle: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
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
  const isAnchor = href.startsWith("#");
  const Wrapper = isAnchor ? "a" : Link;
  const wrapperProps = {
    href,
    "aria-label": `View ${title}`,
    className:
      "flex items-center gap-3 rounded-2xl border border-[#dfc2c0]/25 bg-[#f7dce0]/20 px-4 py-3 transition hover:bg-[#f7dce0]/30",
  };

  return (
    <Wrapper {...wrapperProps}>
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-[#dfc2c0]/35 bg-white/70">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="48px"
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-deep/85">{title}</p>
        <p className="text-[12px] text-deep/55">{subtitle}</p>
      </div>
      <span
        aria-hidden="true"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dfc2c0]/35 bg-white/70 text-deep/70 transition hover:text-deep/90"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4">
          <path
            d="m7.5 4.5 5 5.5-5 5.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
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
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep/55">
          {title}
        </p>
      </div>
      <div className="mt-2 space-y-3">
        {items.map((item) => (
          <PairsWithCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );

  return (
    <section className="py-1 bg-[#fdf9f9]">
      <Container className="!px-0">
        <div className="max-w-3xl text-left">{content}</div>
      </Container>
    </section>
  );
}
