"use client";

import { useEffect, useId, useRef } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  panelClassName?: string;
  contentClassName?: string;
};

export default function Modal({
  open,
  title,
  onClose,
  children,
  panelClassName,
  contentClassName,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const autoFocusedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      autoFocusedRef.current = false;
      return;
    }

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    if (!autoFocusedRef.current) {
      const dialogNode = dialogRef.current;

      if (dialogNode) {
        const autoTarget = dialogNode.querySelector<HTMLElement>(
          "[data-autofocus='true']"
        );
        if (autoTarget) {
          autoTarget.focus();
        } else {
          const focusable = dialogNode.querySelectorAll<HTMLElement>(
            "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"
          );
          const first = focusable[0];
          if (first) {
            first.focus();
          } else {
            dialogNode.focus();
          }
        }
      }
      autoFocusedRef.current = true;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const node = dialogRef.current;
      if (!node) {
        return;
      }

      const focusable = node.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !node.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      lastFocusedRef.current?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-deep/20 px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`w-[min(920px,92vw)] max-w-none rounded-[32px] border border-[#cabab1]/40 bg-[#fdf9f9] p-6 sm:p-10 shadow-[0_24px_60px_rgba(43,89,104,0.12)] focus-visible:outline-none${
          panelClassName ? ` ${panelClassName}` : ""
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-xl text-deep/85 text-center flex-1">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-deep/50 transition-colors hover:text-deep/70 focus-visible:outline-none"
            aria-label="Close modal"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <div className={contentClassName ?? "mt-4"}>{children}</div>
      </div>
    </div>
  );
}
