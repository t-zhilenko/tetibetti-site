type BenefitCardProps = {
  title: string;
  text: string;
};

export default function BenefitCard({ title, text }: BenefitCardProps) {
  return (
    <div className="relative h-full min-h-[132px] sm:min-h-[140px] lg:min-h-[150px] overflow-hidden rounded-3xl bg-white/90 border border-white/60 p-3 lg:p-3 text-center shadow-[0_14px_34px_rgba(43,89,104,0.12)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(43,89,104,0.16)] flex flex-col items-center">
      <p className="text-base lg:text-sm font-semibold text-deep/90 mb-2">
        {title}
      </p>
      <p className="text-sm lg:text-xs text-deep/60 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
