import type { Metadata } from "next";
import Container from "@/components/Container";
import CheckoutResultClient from "@/components/checkout/CheckoutResultClient";
import { resolveLocale } from "@/i18n/locale";
import { isUuid } from "@/lib/server/security";

type CheckoutResultPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutResultPage({ params, searchParams }: CheckoutResultPageProps) {
  const locale = await resolveLocale(params);
  if (!locale) {
    return null;
  }

  const query = await searchParams;
  const orderIdRaw = typeof query.orderId === "string" ? query.orderId.trim() : "";
  const orderId = isUuid(orderIdRaw) ? orderIdRaw : null;

  return (
    <section className="bg-soft min-h-[70vh]">
      <Container className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8 md:p-10">
          <CheckoutResultClient locale={locale} orderId={orderId} />
        </div>
      </Container>
    </section>
  );
}
