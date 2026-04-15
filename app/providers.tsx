"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import CartProvider from "@/components/cart/CartProvider";

const posthogToken = process.env.NEXT_PUBLIC_POSTHOG_TOKEN;
const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (typeof window !== "undefined" && posthogToken && posthogHost) {
  posthog.init(posthogToken, {
    api_host: posthogHost,
    capture_pageview: false,
  });
}

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (
      !posthogToken ||
      !posthogHost ||
      !(posthog as { __loaded?: boolean }).__loaded
    ) {
      return;
    }
    posthog.capture("$pageview");
  }, [pathname, searchParams]);

  return (
    <PostHogProvider client={posthog}>
      <CartProvider>{children}</CartProvider>
    </PostHogProvider>
  );
}
