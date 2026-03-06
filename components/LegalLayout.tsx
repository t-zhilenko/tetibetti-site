import type { ReactNode } from "react";
import Container from "@/components/Container";

type LegalLayoutProps = {
  label: string;
  title: string;
  intro: ReactNode;
  updatedLabel?: string;
  children: ReactNode;
};

export default function LegalLayout({
  label,
  title,
  intro,
  updatedLabel,
  children,
}: LegalLayoutProps) {
  return (
    <section className="bg-[#fdf9f9]">
      <Container className="py-16 md:py-20">
        <div className="mx-auto max-w-[760px] space-y-10">
          <div className="space-y-4">
            <p className="text-[11px] uppercase tracking-[0.35em] text-deep/50">
              {label}
            </p>
            <h1 className="text-3xl md:text-4xl leading-[1.12] tracking-[-0.02em] text-deep/90">
              {title}
            </h1>
            <div className="text-[13px] md:text-[15px] leading-relaxed text-deep/70">
              {intro}
            </div>
            {updatedLabel ? (
              <p className="text-[12px] text-deep/45">{updatedLabel}</p>
            ) : null}
          </div>
          <div className="space-y-8">{children}</div>
        </div>
      </Container>
    </section>
  );
}
