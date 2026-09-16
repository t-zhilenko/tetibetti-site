import {defineRouting} from "next-intl/routing";

// English is switched off for now (2026-09-16): it only confused visitors. The en.json
// messages and every localized route stay in place, so turning it back on is putting "en"
// back into this list and re-enabling detection.
export const routing = defineRouting({
  locales: ["uk"],
  defaultLocale: "uk",
  localePrefix: "always",
  localeDetection: false
});

export type Locale = (typeof routing.locales)[number];
