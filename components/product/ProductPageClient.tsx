"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import EmailCaptureForm from "@/components/EmailCaptureForm";
import ProductGalleryEmbla from "@/components/ProductGalleryEmbla";
import Modal from "@/components/Modal";
import ProductPageLayout from "@/components/product/ProductPageLayout";
import PairsWithSection from "@/components/product/PairsWithSection";
import ProductActions from "@/components/product/ProductActions";
import { trackEvent } from "@/lib/analytics";
import {
  DEFAULT_PAIRS_WITH_TITLE,
  getProductBySlug,
  type ProductImage,
} from "@/content/products";

type ProductPageClientProps = {
  slug: string;
};

export default function ProductPageClient({ slug }: ProductPageClientProps) {
  const product = getProductBySlug(slug);

  if (!product) {
    return null;
  }
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Track product views once per product page.
    trackEvent("product viewed", {
      product_slug: product.slug,
      product_name: product.title,
      page_type: "product",
    });
  }, [product.slug, product.title]);

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
        const related = getProductBySlug(slug);
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
          related.mainPreviewImage?.src ??
          null;
        if (!imageSrc && process.env.NODE_ENV !== "production") {
          // eslint-disable-next-line no-console
          console.warn("PairsWith missing thumbnail", {
            source: product.slug,
            target: related.slug,
          });
        }
        const imageAlt =
          override?.imageAlt ?? related.mainPreviewImage?.alt ?? title;
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
          imageSrc: string | null;
          imageAlt?: string;
        } => Boolean(item)
      );
  }, [product]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const isWaitingStatus = product.status === "waiting";
  const primaryCta = product.primaryCta ?? {
    type: isWaitingStatus ? "waitlist" : "download",
    label: isWaitingStatus ? "Join waitlist" : product.ctaLabel ?? "Download",
    helperText: isWaitingStatus
      ? "We'll email you when the product is ready."
      : product.ctaNote,
  };
  const isWaitlist = primaryCta.type === "waitlist";
  const isNutritionWaitlist =
    isWaitlist && product.slug === "nutrition-meal-planner";
  const waitlistEndpoint = isNutritionWaitlist
    ? "/api/brevo/nutrition-waitlist"
    : "/api/brevo/subscribe";
  const statusBadgeText = product.statusBadgeText ?? product.badge.label;
  const waitlistHelperText =
    primaryCta.helperText ?? "We'll email you when the product is ready.";
  const waitlistSuccessLines =
    product.successMessageLines ?? ["You're on the waitlist."];
  const ctaNote =
    primaryCta.type === "download" && primaryCta.helperText ? (
      <p className="mt-2 text-[12px] text-deep/60">
        {primaryCta.helperText}
      </p>
    ) : null;

  const keyFeatures = product.keyFeatures ?? [];
  const keyFeaturesTitle =
    product.sections?.keyFeaturesSectionTitle ?? product.benefits?.title;
  const keyFeaturesSubtitle =
    product.sections?.keyFeaturesSectionSubtitle ?? product.benefits?.description;
  const benefitsSection =
    keyFeatures.length > 0
      ? {
          title: keyFeaturesTitle ?? "Key Features",
          description: keyFeaturesSubtitle,
          items: keyFeatures.map((feature) => ({
            title: feature.title,
            text: feature.descriptionShort,
          })),
        }
      : product.benefits;

  const sectionAccordion = product.sections?.accordionItems;
  const buildAccordionContent = (value?: string[] | string) => {
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
    ? ([
        {
          id: `${product.slug}-who-its-for`,
          title: "Who It’s For",
          content: buildAccordionContent(sectionAccordion.whoItsFor),
        },
        {
          id: `${product.slug}-whats-inside`,
          title: "What’s Inside",
          content: buildAccordionContent(sectionAccordion.whatsInside),
        },
        {
          id: `${product.slug}-release-plan`,
          title: "Release Plan",
          content: buildAccordionContent(sectionAccordion.releasePlan),
        },
      ] as const).filter(
        (
          item
        ): item is {
          id: string;
          title: string;
          content: ReactNode;
        } => Boolean(item.content)
      )
    : product.detailsAccordion;

  const faqSection = product.faq
    ? {
        ...product.faq,
        title: product.sections?.faqTitle ?? product.faq.title,
        description: product.sections?.faqSubtitle ?? product.faq.description,
      }
    : undefined;

  const relatedContent = pairsWithItems?.length ? (
    <PairsWithSection
      title={product.pairsWithTitle ?? DEFAULT_PAIRS_WITH_TITLE}
      items={pairsWithItems}
    />
  ) : null;

  const modalTitle = "Download Free";
  const modalDescription =
    "Enter your email to receive the Notion template link and setup steps.";
  const modalSuccessTitle = "Check your inbox \uD83D\uDC9F";
  const modalSuccessDescription =
    "Your template link and setup instructions are on the way.";
  const modalSuccessHelp =
    "If you don’t see it in a minute, check Promotions/Spam.";
  const modalSupportEmail = "support@tetibetti.com";

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
              submittingLabel="Adding..."
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
      ctaNote={
        ctaNote
      }
      media={<ProductGalleryEmbla images={carouselImages} />}
      relatedContent={relatedContent}
      relatedContentClassName="mt-4"
      detailsAccordion={detailsAccordionItems}
      actions={
        (product.showActions ?? true) ? (
          <ProductActions
            productSlug={product.slug}
            productTitle={product.title}
          />
        ) : null
      }
      benefits={benefitsSection}
      faq={faqSection}
      afterContent={
        <Modal
          open={isModalOpen}
          title={modalTitle}
          onClose={closeModal}
          contentClassName="mt-6 sm:mt-8"
        >
          <EmailCaptureForm
            key={isModalOpen ? "open" : "closed"}
            variant="download"
            endpoint="/api/brevo/yearly-goals-download"
            submitLabel="Send me the link"
            submittingLabel="Sending..."
            introText={modalDescription}
            successTitle={modalSuccessTitle}
            successDescription={modalSuccessDescription}
            successHelpText={modalSuccessHelp}
            supportEmail={modalSupportEmail}
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
