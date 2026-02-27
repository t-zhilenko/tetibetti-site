type BenefitCardProps = {
  title: string;
  text: string;
};

export default function BenefitCard({ title, text }: BenefitCardProps) {
  return (
    <div className="rounded-2xl bg-[#f7dce0]/16 p-5 text-left">
      <p className="text-sm font-medium text-deep/80">{title}</p>
      <p className="mt-2 text-[13px] text-deep/60 leading-relaxed">{text}</p>
    </div>
  );
}
