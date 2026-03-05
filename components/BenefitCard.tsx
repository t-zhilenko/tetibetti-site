import type { ReactNode } from "react";

type BenefitCardProps = {
  title: string;
  text: ReactNode;
};

export default function BenefitCard({ title, text }: BenefitCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/85 p-5 text-left shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(0,0,0,0.12)] ring-1 ring-white/40 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/40 before:to-transparent before:pointer-events-none">
      <p className="text-sm font-medium text-deep/80">{title}</p>
      <div className="mt-2 space-y-2 text-[13px] text-deep/60 leading-relaxed">
        {text}
      </div>
    </div>
  );
}
