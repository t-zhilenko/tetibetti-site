"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Share2, Mail } from "lucide-react";
import ProductGalleryEmbla from "@/components/ProductGalleryEmbla";
import Modal from "@/components/Modal";
import LanguageSelector from "@/components/LanguageSelector";
import ProductPageLayout from "@/components/product/ProductPageLayout";
import PairsWithSection from "@/components/product/PairsWithSection";
import {
  DEFAULT_PAIRS_WITH_TITLE,
  getProductBySlug,
  type ProductImage,
} from "@/content/products";

type ModalState = "idle" | "loading" | "success" | "error";

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
  const [language, setLanguage] = useState<"en" | "uk">("en");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ModalState>("idle");
  const [emailError, setEmailError] = useState("");
  const [redirectTimer, setRedirectTimer] = useState<number | null>(null);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const shareTimerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
          override?.imageSrc ?? related.mainPreviewImage.src ?? "";
        if (!imageSrc) {
          return null;
        }
        const imageAlt =
          override?.imageAlt ?? related.mainPreviewImage.alt ?? title;
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
  }, [product]);

  useEffect(() => {
    return () => {
      if (redirectTimer) {
        window.clearTimeout(redirectTimer);
      }
      if (shareTimerRef.current) {
        window.clearTimeout(shareTimerRef.current);
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

  const handleShare = async () => {
    if (typeof window === "undefined") {
      return;
    }

    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: product.title, url });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareStatus("copied");
        if (shareTimerRef.current) {
          window.clearTimeout(shareTimerRef.current);
        }
        shareTimerRef.current = window.setTimeout(
          () => setShareStatus("idle"),
          2000
        );
      }
    } catch {
      setShareStatus("copied");
      if (shareTimerRef.current) {
        window.clearTimeout(shareTimerRef.current);
      }
      shareTimerRef.current = window.setTimeout(
        () => setShareStatus("idle"),
        2000
      );
    }
  };

  const handleAskQuestion = () => {
    if (typeof window === "undefined") {
      return;
    }
    const subject = encodeURIComponent(`Question about ${product.title}`);
    window.location.href = `mailto:support@tetibetti.com?subject=${subject}`;
  };

  const isLoading = status === "loading";
  const actionLinkClass =
    "inline-flex items-center gap-[6px] bg-transparent p-0 text-[11px] md:text-[12px] font-normal text-[#2b5968]/55 hover:text-[#2b5968]/80 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#dfc2c0]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9]";

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
      description={product.description}
      badgeLabel={product.badge.label}
      bullets={product.bullets}
      languageSelector={
        product.showLanguageSelector ? (
          <LanguageSelector
            label="Language"
            value={language}
            onChange={setLanguage}
            options={[
              { value: "en", label: "English" },
              { value: "uk", label: "Ukrainian" },
            ]}
          />
        ) : null
      }
      cta={
        <a
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setIsModalOpen(true);
          }}
          className="inline-flex h-14 w-full items-center justify-center rounded-full bg-[#dfc2c0]/90 px-6 text-base font-semibold text-deep border border-[#dfc2c0]/60 transition-colors duration-200 hover:bg-[#d7b7b4]"
        >
          {product.ctaLabel ?? "Download"}
        </a>
      }
      ctaNote={
        product.ctaNote ? (
          <p className="mt-2 text-[12px] text-deep/60">{product.ctaNote}</p>
        ) : null
      }
      media={<ProductGalleryEmbla images={carouselImages} />}
      relatedContent={relatedContent}
      detailsAccordion={product.detailsAccordion}
      actions={
        (product.showActions ?? true) ? (
          <>
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share this product page"
              className={actionLinkClass}
            >
              <Share2 className="h-[14px] w-[14px]" />
              {shareStatus === "copied" ? "Copied" : "Share"}
            </button>
            <button
              type="button"
              onClick={handleAskQuestion}
              aria-label={`Ask a question about ${product.title}`}
              className={actionLinkClass}
            >
              <Mail className="h-[14px] w-[14px]" />
              Ask a question
            </button>
          </>
        ) : null
      }
      benefits={product.benefits}
      faq={product.faq}
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
