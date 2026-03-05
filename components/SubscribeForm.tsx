"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

type Status = "idle" | "loading";

type MessageType = "error" | "success" | null;

type MessageState = {
  type: MessageType;
  text: string;
  visible: boolean;
};

type SubscribeFormProps = {
  tag?: string;
  endpoint?: string;
  extraBody?: Record<string, unknown>;
  className?: string;
  buttonLabel?: string;
  inputClassName?: string;
  buttonClassName?: string;
  layout?: "default" | "aligned";
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SubscribeForm({
  tag,
  endpoint = "/api/subscribe",
  extraBody,
  className,
  buttonLabel,
  inputClassName,
  buttonClassName,
  layout = "default",
}: SubscribeFormProps) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [showSubscribed, setShowSubscribed] = useState(false);
  const [justSucceeded, setJustSucceeded] = useState(false);
  const [message, setMessage] = useState<MessageState>({
    type: null,
    text: "",
    visible: false,
  });
  const timersRef = useRef<number[]>([]);
  const inputId = useId();
  const honeypotId = useId();

  const isLoading = status === "loading";

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedTag = typeof tag === "string" ? tag.trim() : "";

    if (!EMAIL_RE.test(trimmedEmail)) {
      clearTimers();
      setShowSubscribed(false);
      setJustSucceeded(false);
      setMessage({
        type: "error",
        text: "Please enter a valid email address.",
        visible: true,
      });
      setStatus("idle");
      return;
    }

    clearTimers();
    setMessage({ type: null, text: "", visible: false });
    setStatus("loading");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: trimmedEmail,
          tag: trimmedTag || undefined,
          company,
          ...(extraBody ?? {}),
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | { success?: boolean; error?: string }
        | null;

      if (!response.ok || !result?.success) {
        const messageText = result?.error || "Something went wrong.";
        throw new Error(messageText);
      }

      setStatus("idle");
      setEmail("");
      setShowSubscribed(true);
      setMessage({
        type: "success",
        text: "Thank you. You're on the list.",
        visible: true,
      });
      setJustSucceeded(true);

      const pulseTimer = window.setTimeout(() => setJustSucceeded(false), 120);
      const labelTimer = window.setTimeout(() => setShowSubscribed(false), 2200);
      const fadeTimer = window.setTimeout(
        () =>
          setMessage((prev) => ({
            ...prev,
            visible: false,
          })),
        4000
      );
      const clearTimer = window.setTimeout(
        () => setMessage({ type: null, text: "", visible: false }),
        4200
      );

      timersRef.current.push(pulseTimer, labelTimer, fadeTimer, clearTimer);
    } catch (error) {
      setStatus("idle");
      setShowSubscribed(false);
      setJustSucceeded(false);
      setMessage({
        type: "error",
        text:
          error instanceof Error && error.message
            ? error.message
            : "Something went wrong. Please try again.",
        visible: true,
      });
    }
  };

  const messageTone =
    message.type === "error" ? "text-[#cda4a8]" : "text-deep/60";
  const messageVisible = message.visible && message.text;

  if (layout === "aligned") {
    return (
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`mt-10 w-full${
          className ? ` ${className}` : ""
        }`}
      >
        <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
          <label htmlFor={honeypotId} aria-hidden="true">
            Company
          </label>
          <input
            id={honeypotId}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
          />
        </div>
        <label htmlFor={inputId} className="sr-only">
          Email
        </label>
        <div className="flex w-full items-center gap-3">
          <input
            id={inputId}
            type="email"
            name="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (message.type === "error") {
                setMessage({ type: null, text: "", visible: false });
              }
            }}
            placeholder="Your email"
            disabled={isLoading}
            aria-invalid={message.type === "error"}
            aria-describedby={`${inputId}-feedback`}
            className={`h-12 flex-1 rounded-full bg-[#fdfcfa] border px-6 text-sm text-deep placeholder:text-deep/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/40 disabled:opacity-70 transition-colors duration-150 ${
              message.type === "error"
                ? "border-[rgba(223,194,192,0.85)]"
                : "border-[rgba(43,89,104,0.15)]"
            }${inputClassName ? ` ${inputClassName}` : ""}`}
          />
          <button
            type="submit"
            disabled={isLoading}
            className={`h-12 w-auto rounded-full px-6 text-sm font-medium border transition-all duration-200 ${
              isLoading
                ? "bg-blush/70 text-deep/70 border-deep/10 opacity-60 cursor-not-allowed shadow-none"
                : "bg-blush text-deep border-deep/10 hover:bg-[#d7b7b4] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(223,194,192,0.35)] active:translate-y-0"
            } ${justSucceeded ? "scale-[0.98]" : "scale-100"}${
              buttonClassName ? ` ${buttonClassName}` : ""
            }`}
          >
            {isLoading
              ? "Subscribing..."
              : showSubscribed
                ? "Subscribed"
                : buttonLabel ?? "Subscribe"}
          </button>
        </div>
        <div className="min-h-[18px] mt-2 text-left">
          <p
            id={`${inputId}-feedback`}
            className={`text-[12px] ${messageTone} transition-opacity duration-150 ${
              messageVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {message.text}
          </p>
        </div>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`mt-10 flex flex-col sm:flex-row items-stretch justify-center gap-3 mx-auto max-w-[640px]${
        className ? ` ${className}` : ""
      }`}
    >
      <div className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={honeypotId} aria-hidden="true">
          Company
        </label>
        <input
          id={honeypotId}
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>
      <label htmlFor={inputId} className="sr-only">
        Email
      </label>
      <div className="w-full sm:w-[360px]">
        <input
          id={inputId}
          type="email"
          name="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (message.type === "error") {
              setMessage({ type: null, text: "", visible: false });
            }
          }}
          placeholder="Your email"
          disabled={isLoading}
          aria-invalid={message.type === "error"}
          aria-describedby={`${inputId}-feedback`}
          className={`h-12 w-full rounded-full bg-[#fdfcfa] border px-6 text-sm text-deep placeholder:text-deep/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/40 disabled:opacity-70 transition-colors duration-150 ${
            message.type === "error"
              ? "border-[rgba(223,194,192,0.85)]"
              : "border-[rgba(43,89,104,0.15)]"
          }${inputClassName ? ` ${inputClassName}` : ""}`}
        />
        <div className="min-h-[18px] mt-2 text-left">
          <p
            id={`${inputId}-feedback`}
            className={`text-[12px] ${messageTone} transition-opacity duration-150 ${
              messageVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {message.text}
          </p>
        </div>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`h-12 w-full sm:w-auto rounded-full px-6 text-sm font-medium border transition-all duration-200 ${
          isLoading
            ? "bg-blush/70 text-deep/70 border-deep/10 opacity-60 cursor-not-allowed shadow-none"
            : "bg-blush text-deep border-deep/10 hover:bg-[#d7b7b4] hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(223,194,192,0.35)] active:translate-y-0"
        } ${justSucceeded ? "scale-[0.98]" : "scale-100"}${
          buttonClassName ? ` ${buttonClassName}` : ""
        }`}
      >
        {isLoading
          ? "Subscribing..."
          : showSubscribed
            ? "Subscribed"
            : buttonLabel ?? "Subscribe"}
      </button>
    </form>
  );
}
