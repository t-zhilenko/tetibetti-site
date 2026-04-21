import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
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
  const t = await getTranslations({ locale, namespace: "Pages.checkout.successResult" });

  const query = await searchParams;
  const orderIdRaw = typeof query.orderId === "string" ? query.orderId.trim() : "";
  const orderId = isUuid(orderIdRaw) ? orderIdRaw : "";
  const supportEmail = getSupportEmail();
  const order = orderId
    ? await findOrderByIdWithCustomerAndProduct(await getDb(), orderId)
    : null;

  if (order && (order.status === "failed" || order.status === "expired")) {
    redirect(`/${locale}/checkout/failed?orderId=${encodeURIComponent(order.id)}`);
  }

  const isConfirmed = order?.status === "paid";
  const isDelivered = isConfirmed && order.fulfillmentStatus === "delivered";

  return (
    <section className="bg-soft">
      <Container className="py-16">
        <div className="max-w-2xl space-y-6 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
          <h1 className="text-3xl">
            {isConfirmed ? t("confirmedTitle") : t("pendingTitle")}
          </h1>
          <p className="text-sm text-deep/70">
            {isConfirmed
              ? isDelivered
                ? t("confirmedDescriptionDelivered")
                : t("confirmedDescriptionPendingDelivery")
              : t("pendingDescription")}
          </p>
          {orderId ? (
            <p className="text-xs text-deep/55">
              {t("orderIdLabel")}: {orderId}
            </p>
          ) : null}
          <div className="space-y-2 text-sm text-deep/70">
            <p>{isConfirmed ? t("confirmedNoteFolders") : t("pendingNoteEmail")}</p>
            <p>{isConfirmed ? t("confirmedNoteResend") : t("pendingNoteDelay")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isConfirmed ? (
              <Link
                href={`/${locale}/order/lookup${orderId ? `?orderId=${encodeURIComponent(orderId)}` : ""}`}
                className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-5 text-sm text-deep"
              >
                {t("resendAccess")}
              </Link>
            ) : null}
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
