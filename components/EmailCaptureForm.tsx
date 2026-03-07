"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "@/lib/analytics";

type Status = "idle" | "submitting" | "success" | "error";

type EmailCaptureFormProps = {
  variant: "download" | "waitlist";
  endpoint: string;
  submitLabel: string;
  submittingLabel?: string;
  helperText?: string;
  successLines?: string[];
  successTitle?: string;
  successDescription?: string;
  successHelpText?: string;
  supportEmail?: string;
  introText?: string;
  onContinue?: () => void;
  analytics?: {
    source?: string;
    productSlug?: string;
    productName?: string;
  };
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailCaptureForm({
  variant,
  endpoint,
  submitLabel,
  submittingLabel,
  helperText,
  successLines,
  successTitle,
  successDescription,
  successHelpText,
  supportEmail,
  introText,
  onContinue,
  analytics,
}: EmailCaptureFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [submittedOnce, setSubmittedOnce] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";

  const validateEmail = (value: string) => {
    if (!value) {
      return "Email is required";
    }
    if (!EMAIL_RE.test(value)) {
      return "Please enter a valid email";
    }
    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const trimmedEmail = email.trim();
    setSubmittedOnce(true);

    const validationError = validateEmail(trimmedEmail);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const result = (await response.json().catch(() => null)) as
        | { ok?: boolean; success?: boolean; error?: string }
        | null;

      if (!response.ok || (!result?.ok && !result?.success)) {
        throw new Error(result?.error || "Something went wrong.");
      }

      setStatus("success");
      // Capture successful waitlist/download requests without storing email content.
      if (variant === "waitlist") {
        trackEvent("waitlist joined", {
          source: analytics?.source,
          product_slug: analytics?.productSlug,
          form_type: "waitlist",
        });
      }
      if (variant === "download") {
        trackEvent("download requested", {
          source: analytics?.source,
          product_slug: analytics?.productSlug,
          product_name: analytics?.productName,
          form_type: "download",
        });
      }
      setEmail("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const showError = submittedOnce && Boolean(errorMessage) && !isSuccess;

  if (variant === "download" && isSuccess) {
    return (
      <div className="space-y-6 sm:space-y-8 text-center">
        <div>
          <p className="text-[20px] sm:text-[22px] text-deep/85">
            {successTitle}
          </p>
          {successDescription ? (
            <p className="mt-3 text-sm sm:text-base text-deep/60">
              {successDescription}
            </p>
          ) : null}
          {successHelpText ? (
            <p className="mt-3 text-sm sm:text-base text-deep/60">
              {successHelpText}
            </p>
          ) : null}
          {supportEmail ? (
            <p className="mt-3 text-sm sm:text-base text-deep/60">
              Still nothing?{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-deep/70 underline underline-offset-4"
              >
                {supportEmail}
              </a>
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="inline-flex items-center justify-center rounded-full bg-blush px-6 py-3 text-sm sm:text-base font-medium text-deep border border-deep/10 transition-all duration-200 hover:bg-[#d7b7b4] whitespace-nowrap"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-6 sm:space-y-8 text-center"
    >
      {introText ? (
        <p className="text-sm sm:text-base text-deep/65">{introText}</p>
      ) : null}
      <div className="w-full max-w-[720px] mx-auto text-left">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start">
          <div className="w-full">
            <label htmlFor={`email-capture-${variant}`} className="sr-only">
              Email
            </label>
            <input
              id={`email-capture-${variant}`}
              type="text"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errorMessage) {
                  setErrorMessage("");
                }
                if (status === "error" || status === "success") {
                  setStatus("idle");
                }
              }}
              className={`h-14 w-full rounded-full border px-5 text-base text-slate-700 placeholder:text-slate-400/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/40 ${
                showError
                  ? "border-rose-200 bg-rose-50/40"
                  : "border-slate-200/60 bg-white/70"
              }`}
              disabled={isSubmitting}
              aria-invalid={showError}
            />
            <div className="mt-2 min-h-[18px]">
              {showError ? (
                <p className="text-[12px] leading-4 text-rose-400">
                  {errorMessage}
                </p>
              ) : variant === "waitlist" && isSuccess && successLines?.length ? (
                <div className="space-y-1 text-[12px] text-deep/60">
                  {successLines.map((line, index) => (
                    <p key={`${index}-${line.slice(0, 12)}`}>{line}</p>
                  ))}
                </div>
              ) : helperText ? (
                <p className="text-[12px] leading-4 text-slate-400/70">
                  {helperText}
                </p>
              ) : null}
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex h-14 w-full items-center justify-center rounded-full bg-[#dfc2c0]/75 px-10 text-base font-medium text-deep border border-[#dfc2c0]/50 transition-all duration-200 hover:bg-[#d7b7b4]/85 hover:-translate-y-[1px] hover:shadow-[0_6px_14px_rgba(223,194,192,0.22)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[rgba(223,194,192,0.2)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9] whitespace-nowrap leading-none sm:min-w-[220px] ${
              isSubmitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? submittingLabel ?? "Adding..." : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
