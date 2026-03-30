import {hasLocale} from "next-intl";
import {getTranslations} from "next-intl/server";
import LegalLayout from "@/components/LegalLayout";
import {routing, type Locale} from "@/i18n/routing";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type TermsPageProps = {
  params: Promise<{locale: string}>;
};

const toValidLocale = (value: string): Locale | null =>
  hasLocale(routing.locales, value) ? value : null;

export default async function TermsPage({params}: TermsPageProps) {
  const {locale: localeParam} = await params;
  const locale = toValidLocale(localeParam);
  if (!locale) {
    return null;
  }

  const t = await getTranslations({locale, namespace: "Pages.terms"});
  const sections = t.raw("sections") as LegalSection[];

  return (
    <LegalLayout
      label={t("label")}
      title={t("title")}
      updatedLabel={t("updatedLabel")}
      intro={<p>{t("intro")}</p>}
    >
      {sections.map((section, index) => (
        <section
          key={section.title}
          className={index === 0 ? "space-y-3" : "space-y-3 border-t border-deep/10 pt-6"}
        >
          <h2 className="text-lg md:text-xl text-deep/85">{section.title}</h2>
          <div className="text-[13px] md:text-[15px] leading-relaxed text-deep/70 space-y-3">
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets?.length ? (
              <ul className="list-disc pl-5 space-y-2">
                {section.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      ))}
      <section className="space-y-3 border-t border-deep/10 pt-6">
        <h2 className="text-lg md:text-xl text-deep/85">{t("contactTitle")}</h2>
        <div className="text-[13px] md:text-[15px] leading-relaxed text-deep/70">
          <p>
            {t("contactPrefix")}{" "}
            <a
              href="mailto:support@tetibetti.com"
              className="text-deep/85 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7dce0]"
            >
              support@tetibetti.com
            </a>
            .
          </p>
        </div>
      </section>
    </LegalLayout>
  );
}
