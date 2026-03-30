import Image from "next/image";
import {hasLocale} from "next-intl";
import {getTranslations} from "next-intl/server";
import Accordion, {type AccordionItem} from "@/components/Accordion";
import Container from "@/components/Container";
import SupportForm from "@/components/SupportForm";
import {routing, type Locale} from "@/i18n/routing";

type FaqItemContent = {
  id: string;
  title: string;
  content: string;
};

type FaqPageProps = {
  params: Promise<{locale: string}>;
};

const toValidLocale = (value: string): Locale | null =>
  hasLocale(routing.locales, value) ? value : null;

export default async function FaqPage({params}: FaqPageProps) {
  const {locale: localeParam} = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    return null;
  }

  const t = await getTranslations({locale, namespace: "Pages.faq"});
  const items = t.raw("items") as FaqItemContent[];

  const faqItems: AccordionItem[] = items.map((item) => ({
    id: item.id,
    title: item.title,
    content: <p>{item.content}</p>,
  }));

  return (
    <>
      <section className="bg-[#fdf9f9]">
        <Container className="py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start">
            <div className="space-y-5">
              <p className="text-[11px] uppercase tracking-[0.35em] text-deep/50 text-center">
                {t("label")}
              </p>
              <h1 className="text-3xl md:text-4xl leading-[1.12] tracking-[-0.02em] text-deep/90 text-center">
                {t("title")}
              </h1>
              <p className="text-[13px] md:text-[15px] leading-relaxed text-deep/70 max-w-[420px] text-center mx-auto">
                {t("description")}
              </p>
              <div className="mt-8 flex flex-col items-start gap-2 max-w-[360px] sm:max-w-[440px] lg:max-w-[470px]">
                <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[380px] mx-auto flex justify-center">
                  <Image
                    src="/images/faq.png"
                    alt={t("imageAlt")}
                    width={520}
                    height={520}
                    className="varya-tilt w-full h-auto object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.08)]"
                    priority
                  />
                </div>
                <p className="w-full text-center text-[11px] text-deep/45 tracking-[0.02em]">
                  {t("imageCaption")}
                </p>
              </div>
            </div>
            <div className="lg:pt-2">
              <Accordion items={faqItems} />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#fbf3f4] border-t border-deep/10">
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-[520px] text-center space-y-4">
            <h2 className="text-2xl md:text-3xl text-deep/90">{t("stillQuestionTitle")}</h2>
            <p className="text-[13px] md:text-sm text-deep/70 leading-relaxed">
              {t("stillQuestionDescription")}
            </p>
            <div className="mx-auto max-w-[420px] text-left">
              <SupportForm productSlug="faq" variant="inline" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
