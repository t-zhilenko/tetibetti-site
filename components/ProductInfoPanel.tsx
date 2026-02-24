import Link from "next/link";
type ProductInfoPanelProps = {
  title: string;
  priceLabel: string;
  summary: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  meta: string[];
};

export default function ProductInfoPanel({
  title,
  priceLabel,
  summary,
  ctaLabel,
  ctaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  meta,
}: ProductInfoPanelProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.32em] text-deep/45">
          Notion template
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl md:text-4xl text-deep/90">{title}</h1>
          <span className="rounded-full border border-[#dfc2c0]/50 bg-[#dfc2c0]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#2b5968]/85">
            {priceLabel}
          </span>
        </div>
        <p className="text-sm md:text-[15px] text-deep/70 leading-relaxed max-w-[520px]">
          {summary}
        </p>
      </div>

      <div className="space-y-2">
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center rounded-full bg-blush px-6 py-3 text-sm font-medium text-deep border border-deep/10 transition-all duration-200 hover:bg-[#d7b7b4] hover:-translate-y-0.5"
        >
          {ctaLabel}
        </Link>
        {secondaryCtaLabel && secondaryCtaHref ? (
          <div>
            <Link
              href={secondaryCtaHref}
              className="text-xs uppercase tracking-[0.28em] text-deep/55 hover:text-deep/80 transition-colors"
            >
              {secondaryCtaLabel}
            </Link>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[12px] text-deep/55">
        {meta.map((item, index) => (
          <span key={item} className="flex items-center gap-2">
            {index > 0 ? <span className="text-deep/30">·</span> : null}
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
