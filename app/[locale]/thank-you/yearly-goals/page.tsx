import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import Container from "@/components/Container";
import {resolveLocale} from "@/i18n/locale";
import {buildLocalizedPageMetadata} from "@/i18n/metadata";

type ThankYouPageProps = {
  params: Promise<{locale: string}>;
};

export const runtime = "edge";

export async function generateMetadata({params}: ThankYouPageProps): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    params,
    pathname: "/thank-you/yearly-goals",
    namespace: "Pages.thankYouYearlyGoals.meta",
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

export default async function ThankYouYearlyGoalsPage({params}: ThankYouPageProps) {
  const locale = await resolveLocale(params);

  if (!locale) {
    return null;
  }

  const t = await getTranslations({locale, namespace: "Pages.thankYouYearlyGoals"});

  return (
    <section className="bg-[#fdf9f9]">
      <Container className="py-14 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="py-4 md:py-6 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.38em] text-deep/50">{t("label")}</p>
            <h1 className="text-3xl md:text-4xl font-semibold text-deep/95">{t("title")}</h1>
            <p className="text-[13px] md:text-sm text-deep/80 leading-relaxed">{t("description")}</p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#cabab1]/25 text-center text-[12.5px] md:text-sm text-deep/60 leading-relaxed">
            <p className="text-[11px] uppercase tracking-[0.3em] text-deep/50">{t("missingEmailTitle")}</p>
            <p className="mt-4">{t("missingEmailDescription")}</p>
            <p className="mt-4">
              {t("supportPrefix")}{" "}
              <a
                href="mailto:support@tetibetti.com"
                className="inline-flex items-center gap-1 text-deep/85 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7dce0]"
              >
                <span aria-hidden="true">✉</span>
                support@tetibetti.com
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
