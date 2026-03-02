"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Share2, Mail } from "lucide-react";
import Container from "@/components/Container";
import type { AccordionItem } from "@/components/Accordion";
import ProductGalleryEmbla from "@/components/ProductGalleryEmbla";
import SubscribeForm from "@/components/SubscribeForm";
import Modal from "@/components/Modal";
import LanguageSelector from "@/components/LanguageSelector";
import ProductPageLayout, {
  type ProductBenefit,
} from "@/components/product/ProductPageLayout";
import PairsWithSection from "@/components/product/PairsWithSection";
import { getProductBySlug, type ProductImage } from "@/lib/products";

type CarouselImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

type ModalState = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Page() {
  const router = useRouter();
  const product = useMemo(
    () =>
      getProductBySlug("yearly-goals") ?? {
        title: "Yearly Goals",
        priceLabel: "FREE",
        subtitle:
          "A calm, minimalist Notion workspace for yearly planning. Map priorities, track progress, and keep your goals visible without noise.",
        ctaLabel: "Download",
        galleryImages: [],
      },
    []
  );

  const carouselImages = useMemo<CarouselImage[]>(
    () =>
      (product.galleryImages ?? []).map((image: ProductImage) => ({
        src: image.src,
        alt: image.alt,
        objectPosition: image.objectPosition,
      })),
    [product.galleryImages]
  );

  const benefits = useMemo<ProductBenefit[]>(
    () => [
      {
        title: "Quarterly Clarity",
        text: "Work in focused seasons so your goals stop competing for attention.",
      },
      {
        title: "Visible Progress",
        text: "See movement automatically — no manual tracking, no messy dashboards.",
      },
      {
        title: "One Connected System",
        text: "Goals, projects, and tasks stay aligned through relational links.",
      },
      {
        title: "Grounded Execution",
        text: "Monthly views translate vision into realistic daily action.",
      },
      {
        title: "Quiet Automation",
        text: "Built-in buttons handle setup so you can focus on thinking, not formatting.",
      },
    ],
    []
  );

  const detailItems = useMemo<AccordionItem[]>(
    () => [
      {
        id: "what-you-get",
        title: "What You Get",
        content: (
          <div className="space-y-3">
            <p>Inside the template you’ll find:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Yearly Goals dashboard — your main control center</li>
              <li>Quarterly pages (Q1–Q4) with focus planning</li>
              <li>Projects database connected to goals</li>
              <li>Task system with automatic progress calculation</li>
              <li>Monthly to-do view</li>
              <li>Clean relational structure (Goals ↔ Projects ↔ Tasks)</li>
            </ul>
            <p>Everything is connected — nothing duplicated.</p>
          </div>
        ),
      },
      {
        id: "why-it-works",
        title: "Why It Works",
        content: (
          <div className="space-y-3">
            <p>This system works because it combines clarity with structure.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Every goal is connected to projects and tasks</li>
              <li>Progress updates automatically as tasks are completed</li>
              <li>Quarterly focus prevents overwhelm</li>
              <li>Clear “Why” blocks keep motivation visible</li>
              <li>Relational databases remove chaos and duplication</li>
            </ul>
            <p>Instead of scattered to-do lists, you get a single thinking system.</p>
          </div>
        ),
      },
      {
        id: "how-to-use",
        title: "How To Use It",
        content: (
          <div className="space-y-3">
            <p>
              You’ll need a free Notion account (Notion is a free app available on
              desktop and mobile).
            </p>
            <p>After download:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open the template link</li>
              <li>Click “Duplicate” in the top right corner</li>
              <li>Add it to your workspace</li>
              <li>Start customizing your goals</li>
            </ol>
            <p>
              You can modify categories, timelines, and views to match your
              personal workflow.
            </p>
          </div>
        ),
      },
    ],
    []
  );

  const relatedProduct = useMemo(
    () => ({
      title: "Nutrition Meal Planner",
      subtitle: "Coming soon",
      imageSrc: "/images/yearly-goals-preview.svg",
      imageAlt: "Nutrition Meal Planner preview",
      href: "/products/nutrition-meal-planner",
    }),
    []
  );

  const faqItems = useMemo<AccordionItem[]>(
    () => [
      {
        id: "faq-1",
        title: "Do I need Notion Pro?",
        content: (
          <p>
            No. The template works perfectly with the free version of Notion. You
            only need a free Notion account to use it. After downloading,
            duplicate the template into your own workspace and customize it as
            you like — no paid features required.
          </p>
        ),
      },
      {
        id: "faq-2",
        title: "Can I customize it?",
        content: (
          <p>
            Yes — completely. You can rename pages, adjust categories, add new
            properties, change layouts, or simplify the system to fit your
            workflow. The structure is clean and flexible, so it adapts to your
            goals — not the other way around.
          </p>
        ),
      },
      {
        id: "faq-3",
        title: "Is this a one-time download?",
        content: (
          <p>
            Yes. This is a one-time digital download. After download, you’ll
            receive access to the template link and can duplicate it to your
            workspace and use it indefinitely. If small improvements or fixes
            are released later, you’ll receive updated access.
          </p>
        ),
      },
      {
        id: "faq-4",
        title: "Does it include automations?",
        content: (
          <p>
            Yes — built-in setup buttons and relational links are included. The
            system automatically connects goals, projects, and tasks. Progress
            updates without manual tracking, so your dashboard stays clean and
            accurate. No complex scripting or integrations needed.
          </p>
        ),
      },
      {
        id: "faq-5",
        title: "Can I share it with my team?",
        content: (
          <p>
            Yes, you can share it inside Notion just like any other workspace
            page. If you’re using it for a team, each member will need access to
            the duplicated workspace. For larger teams or commercial use, please
            refer to the license terms on the product page.
          </p>
        ),
      },
    ],
    []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ModalState>("idle");
  const [emailError, setEmailError] = useState("");
  const [redirectTimer, setRedirectTimer] = useState<number | null>(null);
  const [language, setLanguage] = useState<"en" | "uk">("en");
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const shareTimerRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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
        body: JSON.stringify({ email: trimmedEmail, tag: "yearly-goals" }),
      });

      const result = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "Something went wrong.");
      }

      setStatus("success");

      const timer = window.setTimeout(() => {
        router.push("/thank-you/yearly-goals");
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
    window.location.href =
      "mailto:support@tetibetti.com?subject=Question%20about%20Yearly%20Goals";
  };

  const isLoading = status === "loading";
  const actionLinkClass =
    "inline-flex items-center gap-[6px] bg-transparent p-0 text-[11px] md:text-[12px] font-normal text-[#2b5968]/55 hover:text-[#2b5968]/80 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#dfc2c0]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9]";
  return (
    <ProductPageLayout
      title={product.title}
      description="A calm, structured Notion system designed to help you plan your year with clarity and intention. Break big goals into focused quarters, connected projects, and meaningful daily action."
      badgeLabel={product.priceLabel}
      bullets={[
        "Goals → Projects → Tasks — fully connected",
        "Built-in quarterly planning system",
        "Automatic progress tracking",
        "Clean, distraction-free structure",
        "Free Notion template — duplicate and use instantly",
      ]}
      languageSelector={
        <LanguageSelector
          label="Language"
          value={language}
          onChange={setLanguage}
          options={[
            { value: "en", label: "English" },
            { value: "uk", label: "Ukrainian" },
          ]}
        />
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
        <p className="mt-2 text-[12px] text-deep/60">
          Works with the free version of Notion.
        </p>
      }
      media={<ProductGalleryEmbla images={carouselImages} />}
      relatedContent={
        <PairsWithSection
          variant="inline"
          title="Pairs well with"
          items={[
            {
              title: relatedProduct.title,
              subtitle: relatedProduct.subtitle,
              href: relatedProduct.href,
              imageSrc: relatedProduct.imageSrc,
              imageAlt: relatedProduct.imageAlt,
            },
          ]}
        />
      }
      detailsAccordion={detailItems}
      actions={
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
            aria-label="Ask a question about Yearly Goals"
            className={actionLinkClass}
          >
            <Mail className="h-[14px] w-[14px]" />
            Ask a question
          </button>
        </>
      }
      benefits={{
        title: "5 Reasons This System Brings Clarity",
        description: "A calm structure that turns intention into consistent action.",
        items: benefits,
      }}
      faq={{
        title: "Frequently Asked Questions",
        description: "Quick answers to keep your download smooth.",
        items: faqItems,
      }}
      extraSection={
        <section id="nutrition-waitlist" className="bg-soft">
          <Container>
            <div className="mx-auto max-w-[900px] text-center space-y-5 py-16 md:py-24">
              <p className="text-xs uppercase tracking-[0.36em] text-deep/40">
                Early Access
              </p>
              <Link href="/products/nutrition-meal-planner" className="inline-flex">
                <h2 className="text-2xl md:text-3xl">Nutrition Meal Planner</h2>
              </Link>
              <p className="text-[13px] md:text-sm text-deep/70 leading-relaxed">
                A calm, structured system designed to simplify meals, groceries,
                and nutrition tracking without overwhelm.
              </p>
              <p className="mt-3 text-[12px] text-deep/45">
                Be the first to access the planner and receive an exclusive
                early-bird launch offer.
              </p>
              <SubscribeForm
                tag="nutrition-meal-planner"
                buttonLabel="Join waitlist"
              />
            </div>
          </Container>
        </section>
      }
      afterContent={
        <Modal open={isModalOpen} title="Download Free" onClose={closeModal}>
          {status === "success" ? (
            <div className="space-y-4">
              <div>
                <p className="text-lg text-deep/85">Sent to your email {"\u2728"}</p>
                <p className="mt-2 text-sm text-deep/60">
                  We just sent your template link + setup steps. Check your inbox
                  (and Promotions/Spam).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (redirectTimer) {
                    window.clearTimeout(redirectTimer);
                    setRedirectTimer(null);
                  }
                  router.push("/thank-you/yearly-goals");
                }}
                className="inline-flex items-center justify-center rounded-full bg-blush px-5 py-2 text-sm font-medium text-deep border border-deep/10 transition-all duration-200 hover:bg-[#d7b7b4]"
              >
                Continue
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} noValidate className="space-y-4">
              <p className="text-sm text-deep/65">
                Enter your email to receive the Notion template link and setup
                steps.
              </p>
              <div>
                <label htmlFor="yearly-goals-email" className="sr-only">
                  Email
                </label>
                <input
                  id="yearly-goals-email"
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
