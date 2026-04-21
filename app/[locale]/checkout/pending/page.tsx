import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/Container";
import { resolveLocale } from "@/i18n/locale";

type LocalizedCheckoutPendingPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LocalizedCheckoutPendingPage({
  params,
}: LocalizedCheckoutPendingPageProps) {
  const locale = await resolveLocale(params);
  if (!locale) {
    return null;
  }
  const t = await getTranslations({ locale, namespace: "Pages.checkout.pendingResult" });

  return (
    <section className="bg-soft min-h-[70vh]">
      <Container className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8 md:p-10">
          <h1 className="text-3xl text-deep/90">{t("title")}</h1>
          <p className="text-sm text-deep/70">{t("description")}</p>
        </div>
      </Container>
    </section>
  );
}
