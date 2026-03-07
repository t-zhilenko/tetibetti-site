"use client";

import posthog from "posthog-js";

type EventProperties = Record<string, unknown>;

const isPostHogReady = () =>
  typeof window !== "undefined" &&
  Boolean((posthog as { __loaded?: boolean }).__loaded);

const sanitizeProperties = (properties?: EventProperties) => {
  if (!properties) {
    return undefined;
  }
  return Object.fromEntries(
    Object.entries(properties).filter(([, value]) => value !== undefined)
  );
};

export const trackEvent = (name: string, properties?: EventProperties) => {
  if (!isPostHogReady()) {
    return;
  }
  posthog.capture(name, sanitizeProperties(properties));
};
