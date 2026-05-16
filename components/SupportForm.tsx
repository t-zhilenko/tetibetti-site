"use client";

import {useEffect, useState, type FormEvent} from "react";
import {useTranslations} from "next-intl";
import {trackEvent} from "@/lib/analytics";

type SupportFormVariant = "modal" | "inline";

type SupportFormProps = {
  productSlug: string;
  contextType?: "product_question" | "order_support";
  orderId?: string;
  subjectOverride?: string;
  initialEmail?: string;
  initialMessage?: string;
  resetKey?: string;
  variant?: SupportFormVariant;
  className?: string;
  rows?: number;
  showSuccessAction?: boolean;
  successActionLabel?: string;
  onSuccessAction?: () => void;
  analyticsEvent?: {
    name: string;
    properties?: Record<string, unknown>;
  };
};

type SupportStatus = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SupportForm({
  productSlug,
  contextType = "product_question",
  orderId,
  subjectOverride,
  initialEmail = "",
  initialMessage = "",
  resetKey,
  variant = "modal",
  className,
  rows,
  showSuccessAction = false,
  successActionLabel,
  onSuccessAction,
  analyticsEvent,
}: SupportFormProps) {
  const t = useTranslations("Forms.support");
  const [supportEmail, setSupportEmail] = useState(initialEmail);
  const [supportMessage, setSupportMessage] = useState(initialMessage);
  const [supportTouched, setSupportTouched] = useState({
    email: false,
    message: false,
  });
  const [supportStatus, setSupportStatus] = useState<SupportStatus>("idle");
  const [supportError, setSupportError] = useState("");

  const isInline = variant === "inline";

  useEffect(() => {
    setSupportEmail(initialEmail);
    setSupportMessage(initialMessage);
    setSupportTouched({email: false, message: false});
    setSupportError("");
    setSupportStatus("idle");
  }, [initialEmail, initialMessage, resetKey]);

  const resetSupportForm = () => {
    setSupportEmail(initialEmail);
    setSupportMessage(initialMessage);
    setSupportTouched({email: false, message: false});
    setSupportError("");
    setSupportStatus("idle");
  };

  const validateSupportForm = () => {
    const trimmedEmail = supportEmail.trim();
    const trimmedMessage = supportMessage.trim();

    if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
      return t("validationEmail");
    }
    if (trimmedMessage.length < 10) {
      return t("validationMessage");
    }
    return "";
  };

  const handleSupportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (supportStatus === "loading") {
      return;
    }

    setSupportTouched({email: true, message: true});
    const validationError = validateSupportForm();
    if (validationError) {
      setSupportError("");
      return;
    }

    setSupportStatus("loading");
    setSupportError("");

    const payload = {
      productSlug,
      contextType,
      orderId,
      subject: subjectOverride,
      email: supportEmail.trim() || undefined,
      message: supportMessage.trim(),
      pageUrl: typeof window === "undefined" ? "" : window.location.href,
    };

    try {
      const response = await fetch("/api/support-message", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | {ok?: boolean; error?: string}
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || t("errorGeneric"));
      }

      setSupportStatus("success");
      if (analyticsEvent) {
        trackEvent(analyticsEvent.name, analyticsEvent.properties);
      }
    } catch (error) {
      setSupportStatus("error");
      setSupportError(
        error instanceof Error && error.message
          ? error.message
          : t("errorTryAgain")
      );
    }
  };

  const emailError =
    supportTouched.email &&
    supportEmail.trim() &&
    !EMAIL_RE.test(supportEmail.trim())
      ? t("validationEmail")
      : "";

  const messageError =
    supportTouched.message && supportMessage.trim().length < 10
      ? t("validationMessage")
      : "";

  const inputClassName = `w-full rounded-full border px-5 text-deep placeholder:text-deep/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-deep/30 ${
    isInline ? "h-10 text-[13px]" : "h-11 text-sm"
  } ${emailError ? "border-rose-200 bg-rose-50/30" : "border-[rgba(43,89,104,0.2)] bg-[#fdfcfa]"}`;

  const textareaClassName = `w-full rounded-2xl border px-4 text-deep placeholder:text-deep/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-deep/30 ${
    isInline ? "py-2.5 text-[13px] leading-relaxed" : "py-3 text-sm"
  } ${messageError ? "border-rose-200 bg-rose-50/30" : "border-[rgba(43,89,104,0.2)] bg-[#fdfcfa]"}`;

  const buttonClassName = `inline-flex w-full items-center justify-center rounded-full px-5 font-medium border transition-all duration-200 ${
    isInline ? "py-2 text-[13px]" : "py-2 text-sm"
  } ${
    supportStatus === "loading"
      ? "bg-blush/60 text-deep/70 border-deep/10 opacity-60 cursor-not-allowed"
      : "bg-blush text-deep border-deep/10 hover:bg-[#d7b7b4]"
  }`;

  const errorTextClassName = isInline
    ? "text-[11px] leading-4 text-rose-400"
    : "text-[12px] leading-4 text-rose-400";

  if (supportStatus === "success") {
    return (
      <div className={className}>
        <div className={isInline ? "space-y-3 text-center" : "space-y-4"}>
          <div>
            <p className="text-lg text-deep/85">{t("successTitle")}</p>
            <p className="mt-2 text-sm text-deep/60">{t("successDescription")}</p>
          </div>
          {showSuccessAction ? (
            <button
              type="button"
              onClick={onSuccessAction ?? resetSupportForm}
              className="inline-flex items-center justify-center rounded-full bg-blush px-5 py-2 text-sm font-medium text-deep border border-deep/10 transition-all duration-200 hover:bg-[#d7b7b4]"
            >
              {successActionLabel ?? t("successAction")}
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSupportSubmit}
      noValidate
      className={
        className
          ? `${className} ${isInline ? "space-y-3" : "space-y-4"}`
          : isInline
            ? "space-y-3"
            : "space-y-4"
      }
    >
      <div>
        <label htmlFor={`${productSlug}-support-email`} className="sr-only">
          {t("emailOptionalLabel")}
        </label>
        <input
          id={`${productSlug}-support-email`}
          type="text"
          inputMode="email"
          autoComplete="email"
          placeholder={t("emailOptionalPlaceholder")}
          value={supportEmail}
          onChange={(event) => {
            setSupportEmail(event.target.value);
            if (supportError) {
              setSupportError("");
            }
          }}
          onBlur={() => {
            setSupportTouched((prev) => ({...prev, email: true}));
          }}
          className={inputClassName}
        />
        <div className={isInline ? "mt-1.5 min-h-[14px]" : "mt-2 min-h-[18px]"}>
          {emailError ? <p className={errorTextClassName}>{emailError}</p> : null}
        </div>
      </div>

      <div>
        <label htmlFor={`${productSlug}-support-message`} className="sr-only">
          {t("messageLabel")}
        </label>
        <textarea
          id={`${productSlug}-support-message`}
          value={supportMessage}
          onChange={(event) => {
            setSupportMessage(event.target.value);
            if (supportError) {
              setSupportError("");
            }
          }}
          onBlur={() => {
            setSupportTouched((prev) => ({...prev, message: true}));
          }}
          placeholder={t("messagePlaceholder")}
          rows={rows ?? (isInline ? 3 : 4)}
          className={textareaClassName}
        />
        <div className={isInline ? "mt-1.5 min-h-[14px]" : "mt-2 min-h-[18px]"}>
          {messageError ? <p className={errorTextClassName}>{messageError}</p> : null}
        </div>
      </div>

      {supportError ? (
        <p className={isInline ? "text-[11px] text-rose-400" : "text-[12px] text-rose-400"}>
          {supportError}
        </p>
      ) : null}

      <button type="submit" disabled={supportStatus === "loading"} className={buttonClassName}>
        {supportStatus === "loading" ? t("buttonLoading") : t("buttonIdle")}
      </button>
    </form>
  );
}
