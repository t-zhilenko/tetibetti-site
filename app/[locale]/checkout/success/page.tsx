import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import { resolveLocale } from "@/i18n/locale";
import { getDb } from "@/lib/server/db";
import { findOrderByIdWithCustomerAndProduct } from "@/lib/server/repositories/orders";
import { isUuid } from "@/lib/server/security";
import { getSupportEmail } from "@/lib/server/support";

type CheckoutSuccessPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: CheckoutSuccessPageProps) {
  const locale = await resolveLocale(params);
  if (!locale) {
    return null;
  }

  const query = await searchParams;
  const orderIdRaw = typeof query.orderId === "string" ? query.orderId.trim() : "";
  const orderId = isUuid(orderIdRaw) ? orderIdRaw : "";
  const supportEmail = getSupportEmail();
  const order = orderId
    ? await findOrderByIdWithCustomerAndProduct(await getDb(), orderId)
    : null;

  const statusTitle =
    order?.status === "paid"
      ? "Payment confirmed"
      : order?.status === "manual_review"
        ? "Payment is being reviewed"
        : order?.status === "failed" || order?.status === "expired"
          ? "Payment not completed"
          : "Payment received / being verified";

  const statusDescription =
    order?.status === "paid" && order.fulfillmentStatus === "delivered"
      ? "Payment confirmed. Your access email has been sent."
      : order?.status === "paid"
        ? "Payment confirmed. We are preparing your access email now."
        : order?.status === "manual_review"
          ? "Your payment is being checked manually. We will email you after verification."
          : order?.status === "failed" || order?.status === "expired"
            ? "This order is not paid yet. You can retry checkout from the product page."
            : "Thank you. Final confirmation is processed after the provider callback.";

  return (
    <section className="bg-soft">
      <Container className="py-16">
        <div className="max-w-2xl space-y-6 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
          <h1 className="text-3xl">{statusTitle}</h1>
          <p className="text-sm text-deep/70">{statusDescription}</p>
          {orderId ? (
            <p className="text-xs text-deep/60">Order ID: {orderId}</p>
          ) : null}
          <div className="space-y-2 text-sm text-deep/70">
            <p>Please check your inbox and spam folder for your access email.</p>
            <p>If you need help, use resend access or contact support.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/order/lookup${orderId ? `?orderId=${encodeURIComponent(orderId)}` : ""}`}
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
