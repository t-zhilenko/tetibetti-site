"use client";

import type { ReactNode } from "react";
import Container from "@/components/Container";
import Accordion, { type AccordionItem } from "@/components/Accordion";
import BenefitCard from "@/components/BenefitCard";
import PriceBadge from "@/components/PriceBadge";

export type ProductBenefit = {
  title: string;
  text: string;
};

type ProductBenefitsSection = {
  title: string;
  description?: string;
  items: ProductBenefit[];
};

type ProductFaqSection = {
  title: string;
  description?: string;
  items: AccordionItem[];
};

type ProductPageLayoutProps = {
  title: string;
  description: ReactNode;
  badgeLabel?: string;
  bullets?: string[];
  languageSelector?: ReactNode;
  cta: ReactNode;
  ctaNote?: ReactNode;
  media: ReactNode;
  detailsAccordion?: AccordionItem[];
  relatedContent?: ReactNode;
  relatedContentClassName?: string;
  actions?: ReactNode;
  benefits?: ProductBenefitsSection;
  faq?: ProductFaqSection;
  detailsAccordionClassName?: string;
  betweenSections?: ReactNode;
  afterContent?: ReactNode;
};

export default function ProductPageLayout({
  title,
  description,
  badgeLabel,
  bullets,
  languageSelector,
  cta,
  ctaNote,
  media,
  detailsAccordion,
  relatedContent,
  relatedContentClassName,
  actions,
  benefits,
  faq,
  detailsAccordionClassName,
  betweenSections,
  afterContent,
}: ProductPageLayoutProps) {
  const benefitColumnsClass = (() => {
    if (!benefits) {
      return "lg:grid-cols-3";
    }
    const count = benefits.items.length;
    if (count <= 5) {
      return `lg:grid-cols-${Math.max(1, count)}` as const;
    }
    if (count % 4 === 0) {
      return "lg:grid-cols-4";
    }
    if (count % 3 === 0) {
      return "lg:grid-cols-3";
    }
    if (count % 5 === 0) {
      return "lg:grid-cols-5";
    }
    if (count % 2 === 0) {
      return "lg:grid-cols-2";
    }
    return "lg:grid-cols-4";
  })();

  return (
    <section className="bg-[#fdf9f9]">
      <Container className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[50px] overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-[13fr_12fr] lg:gap-1 gap-12 items-start">
          <div className="lg:sticky lg:top-24 lg:self-start w-full min-w-0 lg:max-w-[560px]">
            {media}
          </div>
          <div className="w-full min-w-0">
            <h1 className="text-[28px] md:text-[40px] lg:text-[44px] font-medium leading-[1.1] lg:leading-[52px] text-deep/90">
              {title}
            </h1>
            <div className="mt-3.5">
              {typeof description === "string" ? (
                <p className="text-base font-normal leading-7 text-deep/80">
                  {description}
                </p>
              ) : (
                description
              )}
            </div>
            {badgeLabel ? (
              <div className="mt-3.5">
                <PriceBadge label={badgeLabel} />
              </div>
            ) : null}
            {bullets?.length ? (
              <ul className="mt-4 max-w-[520px] space-y-3 text-[15px] leading-[26px] text-deep/80">
                {bullets.map((item) => (
                  <li
                    key={item}
                    className="relative pl-5 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-[#97b5c2]/55"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            {languageSelector ? (
              <div className="mt-[22px]">{languageSelector}</div>
            ) : null}
            <div className="mt-[18px]">{cta}</div>
            {ctaNote}
            {relatedContent ? (
              <div className={relatedContentClassName ?? "mt-6"}>
                {relatedContent}
              </div>
            ) : null}
            {detailsAccordion?.length ? (
              <div className={detailsAccordionClassName ?? "mt-6"}>
                <Accordion items={detailsAccordion} variant="minimal" />
              </div>
            ) : null}
            {actions ? (
              <div className="mt-4 flex flex-wrap items-center gap-[18px] pb-5">
                {actions}
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      {benefits ? (
        <section className="py-16 bg-[#f7dce0]">
          <Container>
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl md:text-3xl text-[#1F4E57]">
                {benefits.title}
              </h2>
              {benefits.description ? (
                <p className="text-sm md:text-[15px] text-[#5E7C85]">
                  {benefits.description}
                </p>
              ) : null}
            </div>
            <div
              className={`mt-10 grid gap-4 sm:grid-cols-2 ${benefitColumnsClass}`}
            >
              {benefits.items.map((benefit) => (
                <BenefitCard
                  key={benefit.title}
                  title={benefit.title}
                  text={benefit.text}
                />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {betweenSections}

      {faq ? (
        <section className="py-16 bg-[#fdf9f9]">
          <Container>
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl md:text-3xl text-deep/90">
                {faq.title}
              </h2>
              {faq.description ? (
                <p className="text-sm md:text-[15px] text-deep/60">
                  {faq.description}
                </p>
              ) : null}
            </div>
            <div className="mt-10 max-w-4xl mx-auto">
              <Accordion items={faq.items} />
            </div>
          </Container>
        </section>
      ) : null}

      {afterContent}
    </section>
  );
}
