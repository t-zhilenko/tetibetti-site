import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import { resolveLocale } from "@/i18n/locale";
import { isUuid } from "@/lib/server/security";
import { getSupportEmail } from "@/lib/server/support";

type CheckoutFailedPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderId?: string }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutFailedPage({
  params,
  searchParams,
}: CheckoutFailedPageProps) {
  const locale = await resolveLocale(params);
  if (!locale) {
    return null;
  }

  const query = await searchParams;
  const orderIdRaw = typeof query.orderId === "string" ? query.orderId.trim() : "";
  const orderId = isUuid(orderIdRaw) ? orderIdRaw : "";
  const supportEmail = getSupportEmail();

  return (
    <section className="bg-soft">
      <Container className="py-16">
        <div className="max-w-2xl space-y-6 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
          <h1 className="text-3xl">Payment not completed</h1>
          <p className="text-sm text-deep/70">
            The payment was canceled or declined. Please try again or contact support.
          </p>
          {orderId ? (
            <p className="text-xs text-deep/60">Order ID: {orderId}</p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/${locale}/checkout`}
              className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep"
            >
              Retry checkout
            </Link>
            <Link
              href={`/${locale}/order/lookup`}
              className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/50 px-5 text-sm text-deep/80"
            >
              Find my order
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
