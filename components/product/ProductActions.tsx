"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, MessageCircle } from "lucide-react";
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
  supportLabel = "Ask a question",
  supportAriaLabel = "Ask a question",
  supportTitle = "Ask a question",
}: ProductActionsProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const sharePopoverRef = useRef<HTMLDivElement | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

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
      ) : null}

      <button
        type="button"
        onClick={() => setIsSupportOpen(true)}
        className={actionButtonClass}
        aria-label={supportAriaLabel}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {supportLabel}
      </button>

      <Modal
        open={isSupportOpen}
        title={supportTitle}
        onClose={handleSupportClose}
      >
        <SupportForm
          productSlug={productSlug}
          variant="modal"
          showSuccessAction
          successActionLabel="Close"
          onSuccessAction={handleSupportClose}
        />
      </Modal>
    </div>
  );
}
