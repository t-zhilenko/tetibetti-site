type PriceBadgeProps = {
  label: string;
};

export default function PriceBadge({ label }: PriceBadgeProps) {
  return (
    <span className="inline-flex h-7 items-center rounded-full border border-[#c9aaa8]/55 bg-[#f2d6d8]/80 px-[10px] text-[11px] font-semibold uppercase tracking-[0.12em] text-deep/80">
      {label}
    </span>
  );
}
