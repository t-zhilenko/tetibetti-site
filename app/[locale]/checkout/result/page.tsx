import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations({ locale, namespace: "Pages.checkout.resultPage" });

  const query = await searchParams;
  const orderIdRaw = typeof query.orderId === "string" ? query.orderId.trim() : "";
  const orderId = isUuid(orderIdRaw) ? orderIdRaw : null;

  return (
    <section className="bg-soft min-h-[70vh]">
      <Container className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8 md:p-10">
          <CheckoutResultClient
            locale={locale}
            orderId={orderId}
            copy={{
              invalidOrder: t("invalidOrder"),
              loading: t("loading"),
              loadFailed: t("loadFailed"),
              paidTitle: t("paidTitle"),
              paidMessage: t("paidMessage"),
              paidSecondary: t("paidSecondary"),
              pendingTitle: t("pendingTitle"),
              pendingMessage: t("pendingMessage"),
              pendingSecondary: t("pendingSecondary"),
              failedTitle: t("failedTitle"),
              failedMessage: t("failedMessage"),
              orderIdLabel: t("orderIdLabel"),
              resendEmail: t("resendEmail"),
              resendingEmail: t("resendingEmail"),
              resendSuccess: t("resendSuccess"),
              resendErrorGeneric: t("resendErrorGeneric"),
              resendErrorUnavailable: t("resendErrorUnavailable"),
              resendErrorRateLimited: t("resendErrorRateLimited"),
              resendErrorOrderUnpaid: t("resendErrorOrderUnpaid"),
              resendErrorDeliveryFailed: t("resendErrorDeliveryFailed"),
              resendErrorCooldown: t("resendErrorCooldown"),
              refreshStatus: t("refreshStatus"),
              refreshingStatus: t("refreshingStatus"),
              contactSupport: t("contactSupport"),
              supportModalTitle: t("supportModalTitle"),
              supportClose: t("supportClose"),
              returnToProduct: t("returnToProduct"),
              returnToShop: t("returnToShop"),
              supportSubjectTemplate: t("supportSubjectTemplate"),
              supportBodyTemplate: t("supportBodyTemplate"),
            }}
          />
        </div>
      </Container>
    </section>
  );
}
