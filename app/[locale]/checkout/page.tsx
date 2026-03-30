import {hasLocale} from "next-intl";
import {getTranslations} from "next-intl/server";
import Container from "@/components/Container";
import {Link} from "@/i18n/navigation";
import {routing, type Locale} from "@/i18n/routing";

type CheckoutPageProps = {
  params: Promise<{locale: string}>;
  searchParams: Promise<{product?: string}>;
};

const toValidLocale = (value: string): Locale | null =>
  hasLocale(routing.locales, value) ? value : null;

export default async function CheckoutPage({params, searchParams}: CheckoutPageProps) {
  const {locale: localeParam} = await params;
  const locale = toValidLocale(localeParam);
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
