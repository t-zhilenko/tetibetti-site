"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Container from "@/components/Container";

type Status = "idle" | "loading";

type MessageType = "error" | "success" | null;

type MessageState = {
  type: MessageType;
  text: string;
  visible: boolean;
};

export default function EmailSubscription() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [showSubscribed, setShowSubscribed] = useState(false);
  const [justSucceeded, setJustSucceeded] = useState(false);
  const [message, setMessage] = useState<MessageState>({
    type: null,
    text: "",
    visible: false,
  });
  const timersRef = useRef<number[]>([]);

  const isLoading = status === "loading";

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
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
    console.log("Email subscription:", trimmedEmail);

    const submitTimer = window.setTimeout(() => {
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
    }, 800);

    timersRef.current.push(submitTimer);
  };

  const messageTone =
    message.type === "error" ? "text-[#cda4a8]" : "text-deep/60";
  const messageVisible = message.visible && message.text;

  return (
    <section className="bg-soft">
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-[900px] text-center space-y-5">
          <p className="text-xs uppercase tracking-[0.36em] text-deep/40">
            STAY IN FLOW
          </p>
          <h2 className="text-2xl md:text-3xl">
            Receive quiet updates and new releases.
          </h2>
          <p className="text-[13px] md:text-sm text-deep/70 leading-relaxed">
            I share new tools, reflections, and thoughtful systems.
            <br />
            No noise. Only what matters.
          </p>
          <p className="mt-3 text-[12px] text-deep/45">
            No spam. Unsubscribe anytime.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-10 flex flex-col sm:flex-row items-stretch justify-center gap-3 mx-auto max-w-[640px]"
        >
          <label htmlFor="newsletter-email" className="sr-only">
            Email
          </label>
          <div className="w-full sm:w-[360px]">
            <input
              id="newsletter-email"
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
              aria-describedby="newsletter-feedback"
              className={`h-12 w-full rounded-full bg-[#fdfcfa] border px-6 text-sm text-deep placeholder:text-deep/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/40 disabled:opacity-70 transition-colors duration-150 ${
                message.type === "error"
                  ? "border-[rgba(223,194,192,0.85)]"
                  : "border-[rgba(43,89,104,0.15)]"
              }`}
            />
            <div className="min-h-[18px] mt-2 text-left">
              <p
                id="newsletter-feedback"
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
            } ${justSucceeded ? "scale-[0.98]" : "scale-100"}`}
          >
            {isLoading ? "Subscribing..." : showSubscribed ? "Subscribed" : "Subscribe"}
          </button>
        </form>
      </Container>
    </section>
  );
}
