"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Share2, MessageCircle } from "lucide-react";
import Modal from "@/components/Modal";

type ProductActionsProps = {
  productSlug: string;
  productTitle: string;
};

type SupportStatus = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProductActions({
  productSlug,
  productTitle,
}: ProductActionsProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const sharePopoverRef = useRef<HTMLDivElement | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportTouched, setSupportTouched] = useState({
    email: false,
    message: false,
  });
  const [supportStatus, setSupportStatus] = useState<SupportStatus>("idle");
  const [supportError, setSupportError] = useState("");

  const showToast = (message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  useEffect(() => {
    if (!isShareOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (
        target &&
        !sharePopoverRef.current?.contains(target) &&
        !shareButtonRef.current?.contains(target)
      ) {
        setIsShareOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsShareOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isShareOpen]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleCopyLink = async () => {
    if (typeof window === "undefined") {
      return;
    }
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch {
      showToast("Couldn't copy. Please copy from address bar.");
    } finally {
      setIsShareOpen(false);
    }
  };

  const handleShareNative = async () => {
    if (typeof window === "undefined" || !navigator.share) {
      return;
    }
    try {
      await navigator.share({ title: productTitle, url: window.location.href });
    } catch {
      // Ignore share cancellation errors.
    } finally {
      setIsShareOpen(false);
    }
  };

  const resetSupportForm = () => {
    setSupportEmail("");
    setSupportMessage("");
    setSupportTouched({ email: false, message: false });
    setSupportError("");
    setSupportStatus("idle");
  };

  const handleSupportClose = () => {
    setIsSupportOpen(false);
    resetSupportForm();
  };

  const validateSupportForm = () => {
    const trimmedEmail = supportEmail.trim();
    const trimmedMessage = supportMessage.trim();

    if (trimmedEmail && !EMAIL_RE.test(trimmedEmail)) {
      return "Please enter a valid email.";
    }
    if (trimmedMessage.length < 10) {
      return "Please enter at least 10 characters.";
    }
    return "";
  };

  const handleSupportSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (supportStatus === "loading") {
      return;
    }

    setSupportTouched({ email: true, message: true });
    const validationError = validateSupportForm();
    if (validationError) {
      setSupportError("");
      return;
    }

    setSupportStatus("loading");
    setSupportError("");

    const payload = {
      productSlug,
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
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || "Something went wrong.");
      }

      setSupportStatus("success");
    } catch (error) {
      setSupportStatus("error");
      setSupportError(
        error instanceof Error && error.message
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const emailError =
    supportTouched.email &&
    supportEmail.trim() &&
    !EMAIL_RE.test(supportEmail.trim())
      ? "Please enter a valid email."
      : "";
  const messageError =
    supportTouched.message && supportMessage.trim().length < 10
      ? "Please enter at least 10 characters."
      : "";

  const actionButtonClass =
    "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/40 px-3 py-1.5 text-[12px] text-deep/70 transition-colors hover:bg-white/60";

  return (
    <div className="relative flex flex-wrap items-center gap-3">
      {toastMessage ? (
        <div className="absolute -top-9 left-0 rounded-full border border-black/10 bg-white/85 px-3 py-1 text-[12px] text-deep/75 shadow-[0_10px_24px_rgba(43,89,104,0.12)]">
          {toastMessage}
        </div>
      ) : null}
      <div className="relative">
        <button
          ref={shareButtonRef}
          type="button"
          onClick={() => setIsShareOpen((prev) => !prev)}
          className={actionButtonClass}
          aria-label="Share this product page"
          aria-expanded={isShareOpen}
          aria-haspopup="menu"
        >
          <Share2 className="h-3.5 w-3.5" />
          Share
        </button>
        {isShareOpen ? (
          <div
            ref={sharePopoverRef}
            role="menu"
            className="absolute left-0 top-full z-20 mt-2 w-40 rounded-2xl border border-black/10 bg-white/95 p-2 shadow-[0_18px_40px_rgba(43,89,104,0.12)]"
          >
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-deep/75 transition-colors hover:bg-[#f7dce0]/35"
              role="menuitem"
            >
              Copy link
            </button>
            {typeof navigator !== "undefined" && navigator.share ? (
              <button
                type="button"
                onClick={handleShareNative}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-deep/75 transition-colors hover:bg-[#f7dce0]/35"
                role="menuitem"
              >
                Share...
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setIsSupportOpen(true)}
        className={actionButtonClass}
        aria-label="Ask a question"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        Ask a question
      </button>

      <Modal
        open={isSupportOpen}
        title="Ask a question"
        onClose={handleSupportClose}
      >
        {supportStatus === "success" ? (
          <div className="space-y-4">
            <div>
              <p className="text-lg text-deep/85">Sent. We'll reply soon.</p>
              <p className="mt-2 text-sm text-deep/60">
                Thanks for reaching out. We'll get back to you by email.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSupportClose}
              className="inline-flex items-center justify-center rounded-full bg-blush px-5 py-2 text-sm font-medium text-deep border border-deep/10 transition-all duration-200 hover:bg-[#d7b7b4]"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSupportSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor={`${productSlug}-support-email`} className="sr-only">
                Email (optional)
              </label>
              <input
                id={`${productSlug}-support-email`}
                type="text"
                inputMode="email"
                autoComplete="email"
                placeholder="Your email (optional)"
                value={supportEmail}
                onChange={(event) => {
                  setSupportEmail(event.target.value);
                  if (supportError) {
                    setSupportError("");
                  }
                }}
                onBlur={() => {
                  setSupportTouched((prev) => ({ ...prev, email: true }));
                }}
                className={`h-11 w-full rounded-full border px-5 text-sm text-deep placeholder:text-deep/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-deep/30 ${
                  emailError
                    ? "border-rose-200 bg-rose-50/30"
                    : "border-[rgba(43,89,104,0.2)] bg-[#fdfcfa]"
                }`}
              />
              <div className="mt-2 min-h-[18px]">
                {emailError ? (
                  <p className="text-[12px] leading-4 text-rose-400">
                    {emailError}
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <label htmlFor={`${productSlug}-support-message`} className="sr-only">
                Message
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
                  setSupportTouched((prev) => ({ ...prev, message: true }));
                }}
                placeholder="Your message"
                rows={4}
                className={`w-full rounded-2xl border px-4 py-3 text-sm text-deep placeholder:text-deep/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-deep/30 ${
                  messageError
                    ? "border-rose-200 bg-rose-50/30"
                    : "border-[rgba(43,89,104,0.2)] bg-[#fdfcfa]"
                }`}
              />
              <div className="mt-2 min-h-[18px]">
                {messageError ? (
                  <p className="text-[12px] leading-4 text-rose-400">
                    {messageError}
                  </p>
                ) : null}
              </div>
            </div>

            {supportError ? (
              <p className="text-[12px] text-rose-400">{supportError}</p>
            ) : null}

            <button
              type="submit"
              disabled={supportStatus === "loading"}
              className={`inline-flex w-full items-center justify-center rounded-full px-5 py-2 text-sm font-medium border transition-all duration-200 ${
                supportStatus === "loading"
                  ? "bg-blush/60 text-deep/70 border-deep/10 opacity-60 cursor-not-allowed"
                  : "bg-blush text-deep border-deep/10 hover:bg-[#d7b7b4]"
              }`}
            >
              {supportStatus === "loading" ? "Sending..." : "Send"}
            </button>
          </form>
        )}
      </Modal>
    </div>
  );
}
