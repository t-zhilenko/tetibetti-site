import {hasLocale} from "next-intl";
import {getTranslations} from "next-intl/server";
import Container from "@/components/Container";
import {routing, type Locale} from "@/i18n/routing";

type SuccessPageProps = {
  params: Promise<{locale: string}>;
};

const toValidLocale = (value: string): Locale | null =>
  hasLocale(routing.locales, value) ? value : null;

export default async function SuccessPage({params}: SuccessPageProps) {
  const {locale: localeParam} = await params;
  const locale = toValidLocale(localeParam);
  if (!locale) {
    return null;
  }

  const t = await getTranslations({locale, namespace: "Pages.success"});

  return (
    <section className="bg-soft">
      <Container className="py-16">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl">{t("title")}</h1>
          <p className="text-sm text-deep/70">{t("description")}</p>
        </div>
      </Container>
    </section>
  );
}
