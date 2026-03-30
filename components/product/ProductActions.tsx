"use client";

import {useEffect, useRef, useState} from "react";
import {Share2, MessageCircle} from "lucide-react";
import {useTranslations} from "next-intl";
import Modal from "@/components/Modal";
import SupportForm from "@/components/SupportForm";

type ProductActionsProps = {
  productSlug: string;
  productTitle: string;
  showShare?: boolean;
  supportLabel?: string;
  supportAriaLabel?: string;
  supportTitle?: string;
};

export default function ProductActions({
  productSlug,
  productTitle,
  showShare = true,
  supportLabel,
  supportAriaLabel,
  supportTitle,
}: ProductActionsProps) {
  const t = useTranslations("Product.actions");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const sharePopoverRef = useRef<HTMLDivElement | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  const resolvedSupportLabel = supportLabel ?? t("askQuestion");
  const resolvedSupportAriaLabel = supportAriaLabel ?? t("askQuestionAria");
  const resolvedSupportTitle = supportTitle ?? t("askQuestion");

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
      showToast(t("linkCopied"));
    } catch {
      showToast(t("copyFailed"));
    } finally {
      setIsShareOpen(false);
    }
  };

  const handleShareNative = async () => {
    if (typeof window === "undefined" || typeof navigator.share !== "function") {
      return;
    }
    try {
      await navigator.share({title: productTitle, url: window.location.href});
    } catch {
      // Ignore share cancellation errors.
    } finally {
      setIsShareOpen(false);
    }
  };

  const handleSupportClose = () => {
    setIsSupportOpen(false);
  };

  const actionButtonClass =
    "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/40 px-3 py-1.5 text-[12px] text-deep/70 transition-colors hover:bg-white/60";

  return (
    <div className="relative flex flex-wrap items-center gap-3">
      {showShare && toastMessage ? (
        <div className="absolute -top-9 left-0 rounded-full border border-black/10 bg-white/85 px-3 py-1 text-[12px] text-deep/75 shadow-[0_10px_24px_rgba(43,89,104,0.12)]">
          {toastMessage}
        </div>
      ) : null}
      {showShare ? (
        <div className="relative inline-block">
          <button
            ref={shareButtonRef}
            type="button"
            onClick={() => setIsShareOpen((prev) => !prev)}
            className={actionButtonClass}
            aria-label={t("shareAria")}
            aria-expanded={isShareOpen}
            aria-haspopup="menu"
          >
            <Share2 className="h-3.5 w-3.5" />
            {t("share")}
          </button>
          {isShareOpen ? (
            <div
              ref={sharePopoverRef}
              role="menu"
              className="absolute left-0 top-full mt-2 w-52 rounded-2xl bg-white/90 backdrop-blur shadow-md border border-neutral-100 p-2 z-50"
            >
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-deep/75 transition-colors hover:bg-[#f7dce0]/35"
                role="menuitem"
              >
                {t("copyLink")}
              </button>
              {typeof navigator !== "undefined" &&
              typeof navigator.share === "function" ? (
                <button
                  type="button"
                  onClick={handleShareNative}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[12px] text-deep/75 transition-colors hover:bg-[#f7dce0]/35"
                  role="menuitem"
                >
                  {t("shareNative")}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsSupportOpen(true)}
        className={actionButtonClass}
        aria-label={resolvedSupportAriaLabel}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {resolvedSupportLabel}
      </button>

      <Modal open={isSupportOpen} title={resolvedSupportTitle} onClose={handleSupportClose}>
        <SupportForm
          productSlug={productSlug}
          variant="modal"
          showSuccessAction
          successActionLabel={t("close")}
          onSuccessAction={handleSupportClose}
        />
      </Modal>
    </div>
  );
}
