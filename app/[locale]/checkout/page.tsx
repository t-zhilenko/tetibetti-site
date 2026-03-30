import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import Container from "@/components/Container";
import {Link} from "@/i18n/navigation";
import {resolveLocale} from "@/i18n/locale";
import {buildLocalizedPageMetadata} from "@/i18n/metadata";

export const runtime = "edge";

type CheckoutPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{product?: string}>;
};

export async function generateMetadata({params}: CheckoutPageProps): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    params,
    pathname: "/checkout",
    namespace: "Pages.checkout.meta",
    robots: {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  });
}

export default async function CheckoutPage({params, searchParams}: CheckoutPageProps) {
  const locale = await resolveLocale(params);
  if (!locale) {
    return null;
  }

  const t = await getTranslations({locale, namespace: "Pages.checkout"});
  const query = await searchParams;
  const product = query.product ?? t("fallbackProduct");

  return (
    <section className="bg-soft">
      <Container className="py-16">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl">{t("title")}</h1>
          <p className="text-sm text-deep/70">
            {t("description")} <span className="font-medium text-deep">{product}</span>.
          </p>
          <Link href="/shop" className="text-sm text-deep/70 underline">
            {t("backToShop")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
