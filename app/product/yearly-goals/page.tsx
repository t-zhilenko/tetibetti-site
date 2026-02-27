"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Share2, Mail } from "lucide-react";
import Container from "@/components/Container";
import Accordion, { type AccordionItem } from "@/components/Accordion";
import ProductGalleryEmbla from "@/components/ProductGalleryEmbla";
import BenefitCard from "@/components/BenefitCard";
import SubscribeForm from "@/components/SubscribeForm";
import Modal from "@/components/Modal";
import PriceBadge from "@/components/PriceBadge";
import LanguageSelector from "@/components/LanguageSelector";

type Product = {
  title: string;
  priceLabel: string;
  subtitle: string;
  ctaLabel: string;
};

type CarouselImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

type Benefit = {
  title: string;
  text: string;
};

type ModalState = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Page() {
  const router = useRouter();
  const product = useMemo<Product>(
    () => ({
      title: "Yearly Goals",
      priceLabel: "FREE",
      subtitle:
        "A calm, minimalist Notion workspace for yearly planning. Map priorities, track progress, and keep your goals visible without noise.",
      ctaLabel: "Download",
    }),
    []
  );

  const carouselImages = useMemo<CarouselImage[]>(
    () => [
      {
        src: "/images/yearly-goals-preview.svg",
        alt: "Yearly Goals preview",
        objectPosition: "50% 50%",
      },
      {
        src: "/images/yearly-goals-preview.svg",
        alt: "Yearly Goals preview detail",
        objectPosition: "50% 50%",
      },
      {
        src: "/images/yearly-goals-preview.svg",
        alt: "Yearly Goals preview layout",
        objectPosition: "50% 50%",
      },
      {
        src: "/images/yearly-goals-preview.svg",
        alt: "Yearly Goals preview calendar view",
        objectPosition: "50% 50%",
      },
      {
        src: "/images/yearly-goals-preview.svg",
        alt: "Yearly Goals preview goals table",
        objectPosition: "50% 50%",
      },
    ],
    []
  );

  const benefits = useMemo<Benefit[]>(
    () => [
      {
        title: "Quarterly Focus",
        text: "Work in calm seasons so goals don't compete for attention.",
      },
      {
        title: "Progress at a Glance",
        text: "See movement without manual tracking or messy dashboards.",
      },
      {
        title: "Connected System",
        text: "Goals, projects, and tasks stay linked automatically.",
      },
      {
        title: "Clear Execution",
        text: "Monthly to-dos keep action grounded and realistic.",
      },
      {
        title: "Quiet Automations",
        text: "Set up the year in minutes with built-in buttons.",
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
          <p>
            Notion template, setup checklist, and lifetime access to updates.
          </p>
        ),
      },
      {
        id: "why-it-works",
        title: "Why It Works",
        content: (
          <p>
            Quarterly focus, connected goals-to-tasks structure, and automatic
            progress tracking to keep your year calm and visible.
          </p>
        ),
      },
      {
        id: "how-to-use",
        title: "How To Use It",
        content: (
          <p>
            Duplicate the template, press the setup buttons, add goals, connect
            tasks, and review monthly or quarterly.
          </p>
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
    }),
    []
  );

  const faqItems = useMemo<AccordionItem[]>(
    () => [
      {
        id: "faq-1",
        title: "Do I need Notion Pro?",
        content: <p>No. The template works with the free plan.</p>,
      },
      {
        id: "faq-2",
        title: "Can I customize it?",
        content: <p>Yes. Duplicate and adjust sections to match your workflow.</p>,
      },
      {
        id: "faq-3",
        title: "Is this a one-time download?",
        content: <p>Yes. You will get an instant duplicate link for your workspace.</p>,
      },
      {
        id: "faq-4",
        title: "Does it include automations?",
        content: <p>Yes. Buttons and simple templates are included.</p>,
      },
      {
        id: "faq-5",
        title: "Can I share it with my team?",
        content: <p>Please keep it personal and invite teammates to your workspace instead.</p>,
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
    <section className="bg-[#fdf9f9]">
      <Container className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-[50px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] lg:gap-16 gap-12 items-start">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGalleryEmbla images={carouselImages} />
          </div>
          <div className="w-full">
            <h1 className="text-[28px] md:text-[40px] lg:text-[44px] font-medium leading-[1.1] lg:leading-[52px] text-deep/90">
              {product.title}
            </h1>
            <p className="mt-3.5 text-base font-normal leading-7 text-deep/80">
              {product.subtitle}
            </p>
            <div className="mt-3.5">
              <PriceBadge label={product.priceLabel} />
            </div>
            <ul className="mt-4 max-w-[520px] list-disc pl-5 space-y-2.5 text-[15px] leading-[26px] text-deep/80 marker:text-[#97b5c2]">
              <li>Goals → Projects → Tasks (connected)</li>
              <li>Progress updates automatically</li>
              <li>Quarterly focus built in</li>
              <li>Includes setup automations</li>
            </ul>
            <div className="mt-[22px]">
              <LanguageSelector
                label="Language"
                value={language}
                onChange={setLanguage}
                options={[
                  { value: "en", label: "English" },
                  { value: "uk", label: "Ukrainian" },
                ]}
              />
            </div>
            <a
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setIsModalOpen(true);
              }}
              className="mt-[18px] inline-flex h-14 w-full items-center justify-center rounded-full bg-[#dfc2c0]/90 px-6 text-base font-semibold text-deep border border-[#dfc2c0]/60 transition-colors duration-200 hover:bg-[#d7b7b4]"
            >
              {product.ctaLabel}
            </a>
            <div className="mt-6">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-deep/55">
                Pairs well with
              </p>
              <a
                href="#nutrition-waitlist"
                className="mt-2 flex items-center gap-3 rounded-2xl border border-[#dfc2c0]/25 bg-[#f7dce0]/20 px-4 py-3 transition hover:bg-[#f7dce0]/30"
                aria-label={`View ${relatedProduct.title}`}
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-[#dfc2c0]/35 bg-white/70">
                  <Image
                    src={relatedProduct.imageSrc}
                    alt={relatedProduct.imageAlt}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-deep/85">
                    {relatedProduct.title}
                  </p>
                  <p className="text-[12px] text-deep/55">
                    {relatedProduct.subtitle}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#dfc2c0]/35 bg-white/70 text-deep/70 transition hover:text-deep/90"
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4">
                    <path
                      d="m7.5 4.5 5 5.5-5 5.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </div>
            <div className="mt-6">
              <Accordion items={detailItems} variant="minimal" />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-[18px] pb-5">
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
            </div>
          </div>
        </div>
      </Container>

      <section className="py-16 bg-[#f7dce0]/14">
        <Container>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl text-deep/90">
              5 Ways This System Keeps You Focused
            </h2>
            <p className="text-sm md:text-[15px] text-deep/60">
              Calm structure that connects vision to action.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {benefits.map((benefit) => (
              <BenefitCard
                key={benefit.title}
                title={benefit.title}
                text={benefit.text}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 bg-[#fdf9f9]">
        <Container>
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl md:text-3xl text-deep/90">
              Frequently Asked Questions
            </h2>
            <p className="text-sm md:text-[15px] text-deep/60">
              Quick answers to keep your download smooth.
            </p>
          </div>
          <div className="mt-10 max-w-4xl mx-auto">
            <Accordion items={faqItems} />
          </div>
        </Container>
      </section>

      <section id="nutrition-waitlist" className="py-16 bg-[#f7dce0]/10">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-3">
              <h2 className="text-2xl md:text-3xl text-deep/90">
                Early access: Nutrition Meal Planner
              </h2>
              <p className="text-sm md:text-[15px] text-deep/60 leading-relaxed">
                Join the waitlist to get early access and an early-bird discount.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
              <div className="rounded-2xl bg-[#fdf9f9] border border-[#cabab1]/35 p-5 text-left">
                <p className="text-[11px] uppercase tracking-[0.22em] text-deep/45">
                  Coming soon
                </p>
                <p className="mt-2 text-base font-medium text-deep/85">
                  Nutrition Meal Planner
                </p>
                <p className="mt-2 text-sm text-deep/60">
                  A calm, structured planner to simplify meals, groceries, and
                  nutrition tracking.
                </p>
                <a
                  href="#nutrition-waitlist"
                  className="mt-4 inline-flex items-center justify-center rounded-full border border-[#cabab1]/40 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-deep/60 transition-colors hover:text-deep/85"
                >
                  Join waitlist
                </a>
              </div>
              <SubscribeForm tag="nutrition-meal-planner" className="w-full" />
            </div>
          </div>
        </Container>
      </section>

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
    </section>
  );
}

