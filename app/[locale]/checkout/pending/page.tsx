import type { Metadata } from "next";
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

  return (
    <section className="bg-soft min-h-[70vh]">
      <Container className="py-16">
        <div className="max-w-2xl space-y-4 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
          <h1 className="text-3xl text-deep/90">Payment is being verified</h1>
          <p className="text-sm text-deep/70">
            We received your return from the payment provider. Confirmation is in progress and your
            access email will be sent after verification.
          </p>
        </div>
      </Container>
    </section>
  );
}
