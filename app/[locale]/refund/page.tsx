import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import Container from "@/components/Container";
import {resolveLocale} from "@/i18n/locale";
import {buildLocalizedPageMetadata} from "@/i18n/metadata";

type RefundPageProps = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: RefundPageProps): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    params,
    pathname: "/refund",
    namespace: "Pages.refund.meta",
  });
}

export default async function RefundPage({params}: RefundPageProps) {
  const locale = await resolveLocale(params);
  if (!locale) {
    return null;
  }

  const t = await getTranslations({locale, namespace: "Pages.refund"});

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
