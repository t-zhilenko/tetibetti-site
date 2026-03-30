import type {Metadata} from "next";
import {getTranslations} from "next-intl/server";
import LegalLayout from "@/components/LegalLayout";
import {resolveLocale} from "@/i18n/locale";
import {buildLocalizedPageMetadata} from "@/i18n/metadata";

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type PrivacyPageProps = {
  params: Promise<{locale: string}>;
};

export const runtime = "edge";

export async function generateMetadata({params}: PrivacyPageProps): Promise<Metadata> {
  return buildLocalizedPageMetadata({
    params,
    pathname: "/privacy",
    namespace: "Pages.privacy.meta",
  });
}

export default async function PrivacyPage({params}: PrivacyPageProps) {
  const locale = await resolveLocale(params);
  if (!locale) {
    return null;
  }

  const t = await getTranslations({locale, namespace: "Pages.privacy"});
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
