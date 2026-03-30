"use client";

import type { ReactNode } from "react";
import Container from "@/components/Container";
import TagsPills from "@/components/TagsPills";
import Accordion, { type AccordionItem } from "@/components/Accordion";
import PriceBadge from "@/components/PriceBadge";
import FeatureCards from "@/components/product/FeatureCards";

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
  tags?: string[];
  tagline?: string;
  badgeLabel?: string;
  bullets?: string[];
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
  tags,
  tagline,
  badgeLabel,
  bullets,
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
  return (
    <section className="bg-[#fdf9f9]">
      <Container className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[50px] overflow-visible">
        <div className="grid grid-cols-1 lg:grid-cols-[13fr_12fr] lg:gap-1 gap-12 items-start">
          <div className="lg:sticky lg:top-24 lg:self-start w-full min-w-0 lg:max-w-[560px]">
            {media}
          </div>
          <div className="w-full min-w-0">
            <h1 className="text-[32px] md:text-[44px] lg:text-[50px] font-medium leading-[1.04] lg:leading-[56px] text-deep/92">
              {title}
            </h1>
            {tags?.length ? (
              <div className="mt-5">
                <TagsPills tags={tags} />
              </div>
            ) : null}
            {tagline ? (
              <p className="mt-3 text-sm text-deep/60 max-w-prose">
                {tagline}
              </p>
            ) : null}
            {badgeLabel ? (
              <div className="mt-5">
                <PriceBadge label={badgeLabel} />
              </div>
            ) : null}
            {bullets?.length ? (
              <ul className="mt-4 max-w-[520px] space-y-2 text-[13px] leading-[22px] text-deep/75">
                {bullets.map((item) => (
                  <li
                    key={item}
                    className="relative pl-4 before:absolute before:left-0 before:top-[0.55em] before:h-1 before:w-1 before:rounded-full before:bg-[#97b5c2]/45"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-5">{cta}</div>
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
        <section className="relative py-16 bg-[#f7dce0] border-y border-[#dfc2c0]/15">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_60%)]" />
          <Container className="relative">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-[22px] md:text-[28px] text-deep/90">
                {benefits.title}
              </h2>
              {benefits.description ? (
                <p className="text-[13px] md:text-[15px] text-deep/55">
                  {benefits.description}
                </p>
              ) : null}
            </div>
            <FeatureCards items={benefits.items} />
          </Container>
        </section>
      ) : null}

      {betweenSections}

      {faq ? (
        <section className="py-16 bg-[#fdf9f9]">
          <Container>
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-[22px] md:text-[28px] text-deep/90">
                {faq.title}
              </h2>
              {faq.description ? (
                <p className="text-[13px] md:text-[15px] text-deep/60">
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
