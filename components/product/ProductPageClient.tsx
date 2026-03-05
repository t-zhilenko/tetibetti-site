"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import ProductGalleryEmbla from "@/components/ProductGalleryEmbla";
import Modal from "@/components/Modal";
import ProductPageLayout from "@/components/product/ProductPageLayout";
import PairsWithSection from "@/components/product/PairsWithSection";
import ProductActions from "@/components/product/ProductActions";
import {
  DEFAULT_PAIRS_WITH_TITLE,
  getProductBySlug,
  type ProductImage,
} from "@/content/products";

type ModalState = "idle" | "loading" | "success" | "error";
type WaitlistStatus = "idle" | "loading" | "success" | "error";

type ProductPageClientProps = {
  slug: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProductPageClient({ slug }: ProductPageClientProps) {
  const product = getProductBySlug(slug);

  if (!product) {
    return null;
  }
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ModalState>("idle");
  const [emailError, setEmailError] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] =
    useState<WaitlistStatus>("idle");
  const [waitlistError, setWaitlistError] = useState("");
  const [waitlistTouched, setWaitlistTouched] = useState(false);
  const [redirectTimer, setRedirectTimer] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const waitlistInputRef = useRef<HTMLInputElement | null>(null);

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

  useEffect(() => {
    return () => {
      if (redirectTimer) {
        window.clearTimeout(redirectTimer);
      }
    };
  }, [redirectTimer]);

  const closeModal = () => {
    if (redirectTimer) {
      window.clearTimeout(redirectTimer);
      setRedirectTimer(null);
    }
    setIsModalOpen(false);
    setStatus("idle");
    setEmailError("");
    setEmail("");
  };

  const getEmailError = (value: string) => {
    if (!value) {
      return "Email is required";
    }
    if (!EMAIL_RE.test(value)) {
      return "Please enter a valid email";
    }
    return "";
  };

  const handleSubscribe = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "loading") {
      return;
    }

    const trimmedEmail = email.trim();
    const validationError = getEmailError(trimmedEmail);

    if (validationError) {
      setEmailError(validationError);
      inputRef.current?.focus();
      return;
    }

    setStatus("loading");
    setEmailError("");

    try {
      if (redirectTimer) {
        window.clearTimeout(redirectTimer);
        setRedirectTimer(null);
      }

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          tag: product.downloadTag ?? product.slug,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Something went wrong.");
      }

      setStatus("success");

      const timer = window.setTimeout(() => {
        router.push(`/thank-you/${product.slug}`);
      }, 2500);
      setRedirectTimer(timer);
    } catch (error) {
      setStatus("error");
      setEmailError(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const handleWaitlistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (waitlistStatus === "loading") {
      return;
    }

    const trimmedEmail = waitlistEmail.trim();
    setWaitlistTouched(true);
    if (!trimmedEmail) {
      setWaitlistError("Email is required");
      return;
    }

    if (!EMAIL_RE.test(trimmedEmail)) {
      setWaitlistError("That email doesn't look right.");
      return;
    }

    setWaitlistStatus("loading");
    setWaitlistError("");

    try {
      const response = await fetch(waitlistEndpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(
          isNutritionWaitlist
            ? {
                email: trimmedEmail,
                product: "nutrition-meal-planner",
                lang: "en",
              }
            : {
                email: trimmedEmail,
                tag: product.downloadTag ?? product.slug,
              }
        ),
      });

      const result = (await response.json().catch(() => null)) as
        | { success?: boolean; ok?: boolean; error?: string }
        | null;

      if (!response.ok || (!result?.success && !result?.ok)) {
        throw new Error(result?.error || "Something went wrong.");
      }

      setWaitlistStatus("success");
      setWaitlistEmail("");
      setWaitlistTouched(false);
      setWaitlistError("");
    } catch (error) {
      setWaitlistStatus("error");
      setWaitlistError(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const isWaitingStatus = product.status === "waiting";
  const primaryCta = product.primaryCta ?? {
    type: isWaitingStatus ? "waitlist" : "download",
    label: isWaitingStatus ? "Join waitlist" : product.ctaLabel ?? "Download",
    helperText: isWaitingStatus
      ? "We’ll email you when the product is ready."
      : product.ctaNote,
  };
  const isWaitlist = primaryCta.type === "waitlist";
  const isNutritionWaitlist = isWaitlist && product.slug === "nutrition-meal-planner";
  const isLoading = status === "loading";
  const isWaitlistLoading = waitlistStatus === "loading";
  const waitlistEndpoint = isNutritionWaitlist ? "/api/waitlist" : "/api/subscribe";
  const waitlistInlineError =
    waitlistTouched && waitlistError ? waitlistError : "";
  const waitlistHelperTone = "text-deep/60";
  const statusBadgeText = product.statusBadgeText ?? product.badge.label;
  const waitlistHelperText =
    primaryCta.helperText ?? "We’ll email you when the product is ready.";
  const waitlistSuccessLines =
    product.successMessageLines ?? ["You’re on the waitlist."];
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
  const modalSuccessTitle = "Sent to your email \u2728";
  const modalSuccessDescription =
    "We just sent your template link + setup steps. Check your inbox (and Promotions/Spam).";

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
            <form
              onSubmit={handleWaitlistSubmit}
              noValidate
              className="flex w-full items-start gap-3"
            >
              <label htmlFor={`${product.slug}-waitlist-email`} className="sr-only">
                Email
              </label>
              <div className="flex-[3_1_0%]">
                <input
                  id={`${product.slug}-waitlist-email`}
                  ref={waitlistInputRef}
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={waitlistEmail}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setWaitlistEmail(nextValue);
                    if (waitlistError) {
                      setWaitlistError("");
                    }
                    if (waitlistStatus === "error") {
                      setWaitlistStatus("idle");
                    }
                  }}
                  onBlur={() => {
                    const trimmed = waitlistEmail.trim();
                    setWaitlistTouched(true);
                    if (!trimmed) {
                      setWaitlistError("");
                      return;
                    }
                    if (!EMAIL_RE.test(trimmed)) {
                      setWaitlistError("That email doesn't look right.");
                      return;
                    }
                    setWaitlistError("");
                  }}
                  placeholder="you@example.com"
                  className={`h-14 w-full rounded-full border px-5 text-sm text-deep placeholder:text-deep/30 focus-visible:outline-none focus-visible:border-[rgba(43,89,104,0.35)] focus-visible:ring-1 focus-visible:ring-[rgba(43,89,104,0.15)] ${
                    waitlistInlineError
                      ? "border-rose-200 bg-rose-50/40"
                      : "border-[rgba(43,89,104,0.2)] bg-[#fdfcfa]"
                  }`}
                  disabled={isWaitlistLoading}
                  aria-invalid={Boolean(waitlistInlineError)}
                />
                <div className="mt-2 min-h-[18px]">
                  {waitlistInlineError ? (
                    <p className="text-[12px] leading-4 text-rose-400">
                      {waitlistInlineError}
                    </p>
                  ) : waitlistStatus !== "success" ? (
                    <p className="text-[12px] leading-4 text-slate-400/70">
                      {waitlistHelperText}
                    </p>
                  ) : null}
                </div>
              </div>
              <button
                type="submit"
                disabled={isWaitlistLoading}
                className={`inline-flex h-14 w-full flex-[1_1_0%] items-center justify-center rounded-full bg-[#dfc2c0]/75 px-6 text-base font-medium text-deep border border-[#dfc2c0]/50 transition-all duration-200 hover:bg-[#d7b7b4]/85 hover:-translate-y-[1px] hover:shadow-[0_6px_14px_rgba(223,194,192,0.22)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(223,194,192,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9] ${
                  isWaitlistLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {isWaitlistLoading ? "Adding..." : primaryCta.label}
              </button>
            </form>
            {waitlistStatus === "success" ? (
              <div className="mt-2 text-left">
                <div className={`space-y-1 text-[12px] ${waitlistHelperTone}`}>
                  {waitlistSuccessLines.map((line, index) => (
                    <p key={`${index}-${line.slice(0, 12)}`}>{line}</p>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setWaitlistStatus("idle");
                      setWaitlistError("");
                      setWaitlistTouched(false);
                      window.setTimeout(
                        () => waitlistInputRef.current?.focus(),
                        0
                      );
                    }}
                    className="text-[12px] text-[#2b5968]/70 hover:text-[#2b5968]/90 transition"
                  >
                    Add another email
                  </button>
                </div>
              </div>
            ) : null}
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
        <Modal open={isModalOpen} title={modalTitle} onClose={closeModal}>
          {status === "success" ? (
            <div className="space-y-4">
              <div>
                <p className="text-lg text-deep/85">{modalSuccessTitle}</p>
                <p className="mt-2 text-sm text-deep/60">
                  {modalSuccessDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (redirectTimer) {
                    window.clearTimeout(redirectTimer);
                    setRedirectTimer(null);
                  }
                  router.push(`/thank-you/${product.slug}`);
                }}
                className="inline-flex items-center justify-center rounded-full bg-blush px-5 py-2 text-sm font-medium text-deep border border-deep/10 transition-all duration-200 hover:bg-[#d7b7b4]"
              >
                Continue
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} noValidate className="space-y-4">
              <p className="text-sm text-deep/65">{modalDescription}</p>
              <div>
                <label htmlFor={`${product.slug}-email`} className="sr-only">
                  Email
                </label>
                <input
                  id={`${product.slug}-email`}
                  ref={inputRef}
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  data-autofocus="true"
                  value={email}
                  onChange={(event) => {
                    const nextValue = event.target.value;
                    setEmail(nextValue);
                    if (emailError) {
                      const nextError = getEmailError(nextValue.trim());
                      if (!nextError) {
                        setEmailError("");
                      }
                    }
                    if (status === "error") {
                      setStatus("idle");
                    }
                  }}
                  onBlur={() => {
                    const nextError = getEmailError(email.trim());
                    if (nextError) {
                      setEmailError(nextError);
                    }
                  }}
                  placeholder="you@example.com"
                  className={`h-11 w-full rounded-full bg-[#fdfcfa] border px-5 text-sm text-deep placeholder:text-deep/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/40 ${
                    emailError
                      ? "border-[rgba(223,194,192,0.85)]"
                      : "border-[rgba(43,89,104,0.2)]"
                  }`}
                  disabled={isLoading}
                  aria-invalid={Boolean(emailError)}
                />
                {emailError ? (
                  <p className="mt-2 text-[12px] text-[#cda4a8]">{emailError}</p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`inline-flex w-full items-center justify-center rounded-full px-5 py-2 text-sm font-medium border transition-all duration-200 ${
                  isLoading
                    ? "bg-blush/60 text-deep/70 border-deep/10 opacity-60 cursor-not-allowed"
                    : "bg-blush text-deep border-deep/10 hover:bg-[#d7b7b4]"
                }`}
              >
                {isLoading ? "Sending..." : "Send me the link"}
              </button>
            </form>
          )}
        </Modal>
      }
    />
  );
}
