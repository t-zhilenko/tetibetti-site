import type { Metadata } from "next";
import Link from "next/link";
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
  status: string,
  fulfillmentStatus: string,
): { title: string; body: string } => {
  if (status === "paid" && fulfillmentStatus === "delivered") {
    return {
      title: "Payment confirmed",
      body: "Your payment is confirmed and your access email has been sent.",
    };
  }

  if (status === "paid") {
    return {
      title: "Payment confirmed",
      body: "Your payment is confirmed. We are finalizing delivery now.",
    };
  }

  if (status === "failed" || status === "expired") {
    return {
      title: "Payment was not completed",
      body: "This order is not paid yet. You can retry checkout or contact support.",
    };
  }

  if (status === "manual_review") {
    return {
      title: "Payment is being reviewed",
      body: "We are verifying this payment manually and will email you as soon as it is resolved.",
    };
  }

  return {
    title: "Payment received, being verified",
    body: "Your payment callback is being verified. This usually takes a moment.",
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

  const statusCopy = order
    ? getStatusMessage(order.status, order.fulfillmentStatus)
    : {
        title: "Payment received, being verified",
        body: "We will send your secure access email after confirmation.",
      };

  return (
    <section className="bg-soft min-h-[70vh]">
      <Container className="py-16">
        <div className="max-w-2xl space-y-6 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
          <div className="space-y-2">
            <h1 className="text-3xl text-deep/90">{statusCopy.title}</h1>
            <p className="text-sm text-deep/70">{statusCopy.body}</p>
          </div>

          {orderId ? <p className="text-xs text-deep/60">Order ID: {orderId}</p> : null}

          <div className="space-y-2 text-sm text-deep/70">
            <p>Please check your inbox and spam folder for the access email.</p>
            <p>If you don&apos;t receive it soon, use resend access or contact support.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/order/lookup${orderId ? `?orderId=${encodeURIComponent(orderId)}` : ""}`}
              className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep"
            >
              Resend access
            </Link>
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
