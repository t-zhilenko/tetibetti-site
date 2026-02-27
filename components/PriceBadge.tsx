type PriceBadgeProps = {
  label: string;
};

export default function PriceBadge({ label }: PriceBadgeProps) {
  return (
    <span className="inline-flex h-7 items-center rounded-full border border-[#dfc2c0]/45 bg-[#f7dce0]/70 px-[10px] text-[12px] font-semibold uppercase tracking-[0.08em] text-deep/85">
      {label}
    </span>
  );
}
