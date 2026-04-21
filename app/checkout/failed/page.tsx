import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import { getDb } from "@/lib/server/db";
import { findOrderByIdWithCustomerAndProduct } from "@/lib/server/repositories/orders";
import { isUuid } from "@/lib/server/security";
import { getSupportEmail } from "@/lib/server/support";

type CheckoutFailedPageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutFailedPage({ searchParams }: CheckoutFailedPageProps) {
  const query = await searchParams;
  const orderIdRaw = typeof query.orderId === "string" ? query.orderId.trim() : "";
  const orderId = isUuid(orderIdRaw) ? orderIdRaw : "";
  const supportEmail = getSupportEmail();
  const order = orderId ? await findOrderByIdWithCustomerAndProduct(await getDb(), orderId) : null;
  const retryHref = `/checkout${order ? `?product=${encodeURIComponent(order.productSlug)}` : ""}`;
  const productHref = order ? `/products/${order.productSlug}` : "/shop";

  return (
    <section className="bg-soft min-h-[70vh]">
      <Container className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl space-y-6 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8 md:p-10">
          <div className="space-y-2">
            <h1 className="text-3xl text-deep/90">Payment not completed</h1>
            <p className="text-sm text-deep/70">Your payment was not confirmed.</p>
            <p className="text-sm text-deep/70">
              You can try again or contact support.
            </p>
          </div>

          {orderId ? <p className="text-xs text-deep/55">Order ID: {orderId}</p> : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href={retryHref}
              className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep"
            >
              Try again
            </Link>
            <Link
              href={productHref}
              className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/50 px-5 text-sm text-deep/80"
            >
              Return to product
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
