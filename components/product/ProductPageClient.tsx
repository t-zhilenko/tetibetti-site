"use client";

import {useEffect, useMemo, useState, type ReactNode} from "react";
import {useTranslations} from "next-intl";
import EmailCaptureForm from "@/components/EmailCaptureForm";
import ProductGalleryEmbla from "@/components/ProductGalleryEmbla";
import Modal from "@/components/Modal";
import ProductPageLayout from "@/components/product/ProductPageLayout";
import PairsWithSection from "@/components/product/PairsWithSection";
import ProductActions from "@/components/product/ProductActions";
import {trackEvent} from "@/lib/analytics";
import type {
  ProductConfig,
  ProductContentBlock,
  ProductImage,
} from "@/content/products";

type ProductPageClientProps = {
  product: ProductConfig;
  allProducts: ProductConfig[];
};

const renderContentBlock = (content: ProductContentBlock): ReactNode => (
  <div className="space-y-3">
    {content.intro ? <p>{content.intro}</p> : null}
    {content.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    {content.bullets?.length ? (
      <ul className="list-disc pl-5 space-y-2">
        {content.bullets.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ) : null}
    {content.ordered?.length ? (
      <ol className="list-decimal pl-5 space-y-2">
        {content.ordered.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    ) : null}
    {content.outro ? <p>{content.outro}</p> : null}
  </div>
);

export default function ProductPageClient({product, allProducts}: ProductPageClientProps) {
  const t = useTranslations("Product");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    trackEvent("product viewed", {
      product_slug: product.slug,
      product_name: product.title,
      page_type: "product",
    });
  }, [product]);

  const carouselImages = useMemo<ProductImage[]>(
    () => product.galleryImages ?? [],
    [product.galleryImages]
  );

  const pairsWithItems = useMemo(() => {
    if (!product.pairsWith?.length) {
      return null;
    }

    return product.pairsWith
      .map((slug) => {
        const related = allProducts.find((item) => item.slug === slug);
        if (!related) {
          return null;
        }
        const override = product.pairsWithOverrides?.[slug];
        const title = override?.title ?? related.title;
        const subtitle = override?.subtitle ?? related.badge.label;
        const imageSrc =
          override?.imageSrc ??
          related.thumbnail ??
          related.galleryImages?.[0]?.src ??
          related.mainPreviewImage?.src;
        if (!imageSrc && process.env.NODE_ENV !== "production") {
          console.warn("PairsWith missing thumbnail", {
            source: product.slug,
            target: related.slug,
          });
        }
        const imageAlt = override?.imageAlt ?? related.mainPreviewImage?.alt ?? title;
        return {
          title,
          subtitle,
          href: `/products/${related.slug}`,
          imageSrc,
          imageAlt,
        };
      })
      .filter(
        (item): item is {
          title: string;
          subtitle: string;
          href: string;
          imageSrc: string;
          imageAlt: string;
        } => Boolean(item)
      );
  }, [allProducts, product]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const isWaitingStatus = product.status === "waiting";
  const primaryCta = product.primaryCta ?? {
    type: isWaitingStatus ? "waitlist" : "download",
    label: isWaitingStatus ? t("joinWaitlist") : product.ctaLabel ?? t("download"),
    helperText: isWaitingStatus ? t("waitlistHelperDefault") : product.ctaNote,
  };

  const isWaitlist = primaryCta.type === "waitlist";
  const isNutritionWaitlist = isWaitlist && product.slug === "nutrition-meal-planner";
  const waitlistEndpoint = isNutritionWaitlist
    ? "/api/brevo/nutrition-waitlist"
    : "/api/brevo/subscribe";
  const statusBadgeText = product.statusBadgeText ?? product.badge.label;
  const waitlistHelperText = primaryCta.helperText ?? t("waitlistHelperDefault");
  const waitlistSuccessLines = product.successMessageLines ?? [t("waitlistSuccessDefault")];
  const ctaNote =
    primaryCta.type === "download" && primaryCta.helperText ? (
      <p className="mt-2 text-[12px] text-deep/60">{primaryCta.helperText}</p>
    ) : null;

  const keyFeatures = product.keyFeatures ?? [];
  const keyFeaturesTitle = product.sections?.keyFeaturesSectionTitle ?? product.benefits?.title;
  const keyFeaturesSubtitle =
    product.sections?.keyFeaturesSectionSubtitle ?? product.benefits?.description;

  const benefitsSection =
    keyFeatures.length > 0
      ? {
          title: keyFeaturesTitle ?? t("keyFeatures"),
          description: keyFeaturesSubtitle,
          items: keyFeatures.map((feature) => ({
            title: feature.title,
            text: feature.descriptionShort,
          })),
        }
      : product.benefits;

  const sectionAccordion = product.sections?.accordionItems;

  const buildAccordionContent = (value?: string[] | string): ReactNode | null => {
    if (!value) {
      return null;
    }
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc space-y-2 pl-5">
          {value.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    }
    return <p>{value}</p>;
  };

  const detailsAccordionItems = sectionAccordion
    ? [
        {
          id: `${product.slug}-who-its-for`,
          title: t("whoItsFor"),
          content: buildAccordionContent(sectionAccordion.whoItsFor),
        },
        {
          id: `${product.slug}-whats-inside`,
          title: t("whatsInside"),
          content: buildAccordionContent(sectionAccordion.whatsInside),
        },
        {
          id: `${product.slug}-release-plan`,
          title: t("releasePlan"),
          content: buildAccordionContent(sectionAccordion.releasePlan),
        },
      ].filter((item) => Boolean(item.content))
    : product.detailsAccordion
        .map((section) => ({
          id: section.id,
          title: section.title,
          content: renderContentBlock(section.content),
        }))
        .filter((item) => Boolean(item.content));

  const faqSection = product.faq
    ? {
        title: product.sections?.faqTitle ?? product.faq.title,
        description: product.sections?.faqSubtitle ?? product.faq.description,
        items: product.faq.items.map((item) => ({
          id: item.id,
          title: item.title,
          content: <p>{item.answer}</p>,
        })),
      }
    : undefined;

  const relatedContent = pairsWithItems?.length ? (
    <PairsWithSection title={product.pairsWithTitle ?? t("pairsWellWith")} items={pairsWithItems} />
  ) : null;

  return (
    <ProductPageLayout
      title={product.title}
      tags={product.tags}
      tagline={product.tagline}
      badgeLabel={statusBadgeText}
      bullets={product.bullets}
      cta={
        isWaitlist ? (
          <div className="w-full">
            <EmailCaptureForm
              variant="waitlist"
              endpoint={waitlistEndpoint}
              submitLabel={primaryCta.label}
              submittingLabel={t("adding")}
              helperText={waitlistHelperText}
              successLines={waitlistSuccessLines}
              analytics={{
                source: "product_page",
                productSlug: product.slug,
                productName: product.title,
              }}
            />
          </div>
        ) : (
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              setIsModalOpen(true);
            }}
            className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#dfc2c0]/75 px-6 text-base font-medium text-deep border border-[#dfc2c0]/50 transition-all duration-200 hover:bg-[#d7b7b4]/85 hover:-translate-y-[1px] hover:shadow-[0_6px_14px_rgba(223,194,192,0.22)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(223,194,192,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9]"
          >
            {primaryCta.label}
          </a>
        )
      }
      ctaNote={ctaNote}
      media={<ProductGalleryEmbla images={carouselImages} />}
      relatedContent={relatedContent}
      relatedContentClassName="mt-4"
      detailsAccordion={detailsAccordionItems}
      actions={
        (product.showActions ?? true) ? (
          <ProductActions productSlug={product.slug} productTitle={product.title} />
        ) : null
      }
      benefits={benefitsSection}
      faq={faqSection}
      afterContent={
        <Modal open={isModalOpen} title={t("downloadFree")} onClose={closeModal} contentClassName="mt-6 sm:mt-8">
          <EmailCaptureForm
            key={isModalOpen ? "open" : "closed"}
            variant="download"
            endpoint="/api/brevo/yearly-goals-download"
            submitLabel={t("sendMeLink")}
            submittingLabel={t("sending")}
            introText={t("downloadModalIntro")}
            successTitle={t("downloadModalSuccessTitle")}
            successDescription={t("downloadModalSuccessDescription")}
            successHelpText={t("downloadModalSuccessHelp")}
            supportEmail="support@tetibetti.com"
            onContinue={closeModal}
            analytics={{
              source: "download_modal",
              productSlug: product.slug,
              productName: product.title,
            }}
          />
        </Modal>
      }
    />
  );
}
