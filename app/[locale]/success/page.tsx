import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import Container from "@/components/Container";
import {resolveLocale} from "@/i18n/locale";
import {buildLocalizedPageMetadata} from "@/i18n/metadata";

type SuccessPageProps = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata({params}: SuccessPageProps): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    params,
    pathname: "/success",
    namespace: "Pages.success.meta",
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

export default async function SuccessPage({params}: SuccessPageProps) {
  const locale = await resolveLocale(params);
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
