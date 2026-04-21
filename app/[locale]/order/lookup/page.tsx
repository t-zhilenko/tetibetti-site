import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
  const t = await getTranslations({ locale, namespace: "Pages.orderLookup" });

  const query = await searchParams;
  const orderIdRaw = typeof query.orderId === "string" ? query.orderId.trim() : "";
  const initialOrderId = isUuid(orderIdRaw) ? orderIdRaw : "";

  return (
    <section className="bg-soft min-h-[70vh]">
      <Container className="py-16">
        <OrderLookupClient
          supportEmail={getSupportEmail()}
          initialOrderId={initialOrderId}
          checkoutBasePath={`/${locale}/checkout`}
          copy={{
            title: t("title"),
            description: t("description"),
            initialOrderIdLabel: t("initialOrderIdLabel"),
            emailLabel: t("emailLabel"),
            emailPlaceholder: t("emailPlaceholder"),
            findOrders: t("findOrders"),
            searching: t("searching"),
            lookupEmpty: t("lookupEmpty"),
            lookupErrorGeneric: t("lookupErrorGeneric"),
            lookupErrorUnavailable: t("lookupErrorUnavailable"),
            lookupErrorInvalidEmail: t("lookupErrorInvalidEmail"),
            lookupErrorRateLimited: t("lookupErrorRateLimited"),
            resendSuccess: t("resendSuccess"),
            resendErrorGeneric: t("resendErrorGeneric"),
            resendErrorUnavailable: t("resendErrorUnavailable"),
            resendErrorInvalidEmail: t("resendErrorInvalidEmail"),
            resendErrorRateLimited: t("resendErrorRateLimited"),
            resendErrorOrderNotFound: t("resendErrorOrderNotFound"),
            resendErrorOrderUnpaid: t("resendErrorOrderUnpaid"),
            resendErrorDeliveryFailed: t("resendErrorDeliveryFailed"),
            resendErrorCooldown: t("resendErrorCooldown"),
            orderLabel: t("orderLabel"),
            paidAtLabel: t("paidAtLabel"),
            paymentConfirmed: t("paymentConfirmed"),
            paymentNotCompleted: t("paymentNotCompleted"),
            paymentNotConfirmed: t("paymentNotConfirmed"),
            paymentVerifying: t("paymentVerifying"),
            deliveryFailed: t("deliveryFailed"),
            deliveryDelivered: t("deliveryDelivered"),
            deliveryOnTheWay: t("deliveryOnTheWay"),
            resending: t("resending"),
            resendAccess: t("resendAccess"),
            completePayment: t("completePayment"),
            needHelp: t("needHelp"),
          }}
        />
      </Container>
    </section>
  );
}
