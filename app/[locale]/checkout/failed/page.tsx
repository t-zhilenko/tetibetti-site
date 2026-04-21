import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Container from "@/components/Container";
import { resolveLocale } from "@/i18n/locale";
import { getDb } from "@/lib/server/db";
import { findOrderByIdWithCustomerAndProduct } from "@/lib/server/repositories/orders";
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
  const t = await getTranslations({ locale, namespace: "Pages.checkout.failedResult" });

  const query = await searchParams;
  const orderIdRaw = typeof query.orderId === "string" ? query.orderId.trim() : "";
  const orderId = isUuid(orderIdRaw) ? orderIdRaw : "";
  const supportEmail = getSupportEmail();
  const order = orderId ? await findOrderByIdWithCustomerAndProduct(await getDb(), orderId) : null;
  const retryHref = `/${locale}/checkout${order ? `?product=${encodeURIComponent(order.productSlug)}` : ""}`;
  const productHref = order ? `/${locale}/products/${order.productSlug}` : `/${locale}/shop`;

  return (
    <section className="bg-soft">
      <Container className="py-16">
        <div className="max-w-2xl space-y-6 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
          <h1 className="text-3xl">{t("title")}</h1>
          <p className="text-sm text-deep/70">{t("description")}</p>
          <p className="text-sm text-deep/70">{t("note")}</p>
          {orderId ? (
            <p className="text-xs text-deep/55">
              {t("orderIdLabel")}: {orderId}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Link
              href={retryHref}
              className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep"
            >
              {t("tryAgain")}
            </Link>
            <Link
              href={productHref}
              className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/50 px-5 text-sm text-deep/80"
            >
              {t("returnToProduct")}
            </Link>
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/50 px-5 text-sm text-deep/80"
            >
              {t("contactSupport")}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
