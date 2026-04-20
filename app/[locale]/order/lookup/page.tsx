import type { Metadata } from "next";
import Container from "@/components/Container";
import OrderLookupClient from "@/components/orders/OrderLookupClient";
import { resolveLocale } from "@/i18n/locale";
import { isUuid } from "@/lib/server/security";
import { getSupportEmail } from "@/lib/server/support";

type LocalizedOrderLookupPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LocalizedOrderLookupPage({
  params,
  searchParams,
}: LocalizedOrderLookupPageProps) {
  const locale = await resolveLocale(params);
  if (!locale) {
    return null;
  }

  const query = await searchParams;
  const orderIdRaw = typeof query.orderId === "string" ? query.orderId.trim() : "";
  const initialOrderId = isUuid(orderIdRaw) ? orderIdRaw : "";

  return (
    <section className="bg-soft min-h-[70vh]">
      <Container className="py-16">
        <OrderLookupClient supportEmail={getSupportEmail()} initialOrderId={initialOrderId} />
      </Container>
    </section>
  );
}
