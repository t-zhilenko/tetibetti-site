"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import Accordion, { type AccordionItem } from "@/components/Accordion";
import ProductGallery from "@/components/ProductGallery";
import ProductInfoPanel from "@/components/ProductInfoPanel";
import SubscribeForm from "@/components/SubscribeForm";
import Modal from "@/components/Modal";

type Product = {
  title: string;
  priceLabel: string;
  summary: string;
  ctaLabel: string;
  ctaHref: string;
  meta: string[];
  images: { src: string; alt?: string }[];
  sections: AccordionItem[];
  subscribeTag?: string;
};

type ModalState = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Page() {
  const router = useRouter();
  const product = useMemo<Product>(
    () => ({
      title: "Yearly Goals (Notion Template)",
      priceLabel: "Free",
      summary:
        "A calm, minimalist Notion workspace for yearly planning. Map priorities, track progress, and keep your goals visible without noise.",
      ctaLabel: "Download Free",
      ctaHref: "#",
      meta: ["Instant download", "Notion template", "Minimal design"],
      images: [
        {
          src: "/images/yearly-goals-preview.svg",
          alt: "Yearly Goals Notion template preview",
        },
      ],
      sections: [
        {
          id: "product-info",
          title: "Product info",
          defaultOpen: true,
          content: (
            <div>
              <p>
                Designed for quiet focus and structured reflection. Plan the year
                in one view, then zoom into monthly milestones without breaking
                flow.
              </p>
              <p>
                Built with clean sections, soft color accents, and a gentle rhythm
                so the template stays out of your way.
              </p>
              <p>
                Use it as a yearly reset or a gentle companion for ongoing review.
              </p>
            </div>
          ),
        },
        {
          id: "whats-inside",
          title: "What's inside",
          content: (
            <ul>
              <li>Year overview dashboard</li>
              <li>Goal tracker with quarterly checkpoints</li>
              <li>Monthly review prompts</li>
              <li>Simple habit and project boards</li>
              <li>Focused notes for wins and learnings</li>
            </ul>
          ),
        },
        {
          id: "faq",
          title: "FAQ",
          content: (
            <div>
              <p>
                <span className="font-medium text-deep/80">
                  Do I need Notion Pro?
                </span>
                <br />
                No. The template works with the free plan.
              </p>
              <p>
                <span className="font-medium text-deep/80">
                  Can I customize it?
                </span>
                <br />
                Yes. Duplicate and adjust sections to match your workflow.
              </p>
              <p>
                <span className="font-medium text-deep/80">
                  Is this a one-time download?
                </span>
                <br />
                Yes. You will get an instant duplicate link for your workspace.
              </p>
              <p>
                <span className="font-medium text-deep/80">
                  Can I share it with my team?
                </span>
                <br />
                Please keep it personal and invite teammates to your workspace
                instead.
              </p>
            </div>
          ),
        },
        {
          id: "terms",
          title: "License / terms",
          content: (
            <div>
              <p>Digital product. No refunds after download.</p>
              <p>For personal use only. Please don't resell or redistribute.</p>
              <p>You may customize for your own workflow.</p>
            </div>
          ),
        },
      ],
      subscribeTag: "yearly-goals",
    }),
    []
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<ModalState>("idle");
  const [emailError, setEmailError] = useState("");
  const [redirectTimer, setRedirectTimer] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const isLoading = status === "loading";

  return (
    <section className="bg-[#fdf9f9]">
      <Container className="pt-10 pb-16 md:pt-14 md:pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.95fr] items-start">
          <ProductGallery images={product.images} title={product.title} />
          <div className="space-y-8">
            <ProductInfoPanel
              title={product.title}
              priceLabel={product.priceLabel}
              summary={product.summary}
              ctaLabel={product.ctaLabel}
              ctaHref={product.ctaHref}
              meta={product.meta}
              onCtaClick={() => setIsModalOpen(true)}
            />
            <Accordion items={product.sections} />
          </div>
        </div>
      </Container>
      <div
        id="product-updates"
        className="mt-8 md:mt-12 bg-[#dfc2c0]/18 border-y border-[#cabab1]/35"
      >
        <Container className="py-12 md:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] uppercase tracking-[0.32em] text-deep/45">
              Get updates by email
            </p>
            <p className="mt-3 text-sm text-deep/60 leading-relaxed">
              New releases, updates, and early-subscriber discounts. No spam.
            </p>
            <SubscribeForm
              tag={product.subscribeTag}
              className="mt-6 max-w-[560px]"
            />
          </div>
        </Container>
      </div>

      <Modal open={isModalOpen} title="Download Free" onClose={closeModal}>
        {status === "success" ? (
            <div className="space-y-4">
            <div>
              <p className="text-lg text-deep/85">
                Sent to your email {"\u2728"}
              </p>
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
                <p className="mt-2 text-[12px] text-[#cda4a8]">
                  {emailError}
                </p>
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
