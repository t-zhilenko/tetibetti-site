import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import Container from "@/components/Container";
import { getDb } from "@/lib/server/db";
import { findOrderByIdWithCustomerAndProduct } from "@/lib/server/repositories/orders";
import { isUuid } from "@/lib/server/security";
import { getSupportEmail } from "@/lib/server/support";

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

const getStatusMessage = (
  isConfirmed: boolean,
  isDelivered: boolean,
): {
  title: string;
  body: string;
  notePrimary: string;
  noteSecondary: string;
} => {
  if (isConfirmed && isDelivered) {
    return {
      title: "Payment confirmed",
      body: "Your access email has been sent.",
      notePrimary: "If you do not see it yet, check Spam or Promotions.",
      noteSecondary: "You can resend access anytime.",
    };
  }

  if (isConfirmed) {
    return {
      title: "Payment confirmed",
      body: "Your access email is on the way.",
      notePrimary: "If you do not see it yet, check Spam or Promotions.",
      noteSecondary: "You can resend access anytime.",
    };
  }

  return {
    title: "Payment received",
    body: "We are verifying it now.",
    notePrimary: "Your access link will be sent by email after confirmation.",
    noteSecondary: "This can take a few minutes.",
  };
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const query = await searchParams;
  const orderIdRaw = typeof query.orderId === "string" ? query.orderId.trim() : "";
  const orderId = isUuid(orderIdRaw) ? orderIdRaw : "";
  const supportEmail = getSupportEmail();
  let order =
    orderId.length > 0
      ? await findOrderByIdWithCustomerAndProduct(await getDb(), orderId)
      : null;

  if (!orderId) {
    order = null;
  }

  if (order && (order.status === "failed" || order.status === "expired")) {
    redirect(`/checkout/failed?orderId=${encodeURIComponent(order.id)}`);
  }

  const isConfirmed = order?.status === "paid";
  const isDelivered = isConfirmed && order?.fulfillmentStatus === "delivered";
  const statusCopy = getStatusMessage(isConfirmed, isDelivered);

  return (
    <section className="bg-soft min-h-[70vh]">
      <Container className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8 md:p-10">
          <div className="space-y-2">
            <h1 className="text-3xl text-deep/90">{statusCopy.title}</h1>
            <p className="text-sm text-deep/70">{statusCopy.body}</p>
          </div>

          {orderId ? <p className="text-xs text-deep/55">Order ID: {orderId}</p> : null}

          <div className="space-y-2 text-sm text-deep/70">
            <p>{statusCopy.notePrimary}</p>
            <p>{statusCopy.noteSecondary}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isConfirmed ? (
              <Link
                href={`/order/lookup${orderId ? `?orderId=${encodeURIComponent(orderId)}` : ""}`}
                className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep"
              >
                Resend access
              </Link>
            ) : null}
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/50 px-5 text-sm text-deep/80"
            >
              Contact support
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
