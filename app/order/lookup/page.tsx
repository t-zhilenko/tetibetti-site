import type { Metadata } from "next";
import Container from "@/components/Container";
import OrderLookupClient from "@/components/orders/OrderLookupClient";
import { isUuid } from "@/lib/server/security";
import { getSupportEmail } from "@/lib/server/support";

type OrderLookupPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrderLookupPage({ searchParams }: OrderLookupPageProps) {
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
