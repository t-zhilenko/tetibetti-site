import Image from "next/image";
import {hasLocale} from "next-intl";
import {getTranslations} from "next-intl/server";
import Container from "@/components/Container";
import SubscribeForm from "@/components/SubscribeForm";
import {routing, type Locale} from "@/i18n/routing";

type AboutPageProps = {
  params: Promise<{locale: string}>;
};

const toValidLocale = (value: string): Locale | null =>
  hasLocale(routing.locales, value) ? value : null;

export default async function AboutPage({params}: AboutPageProps) {
  const {locale: localeParam} = await params;
  const locale = toValidLocale(localeParam);

  if (!locale) {
    return null;
  }

  const t = await getTranslations({locale, namespace: "Pages.about"});
  const lovedItems = t.raw("things") as string[];
  const pathItems = t.raw("pathItems") as string[];

  return (
    <>
      <section className="relative overflow-hidden bg-soft bg-[radial-gradient(900px_420px_at_80%_85%,rgba(223,194,192,0.08),transparent_70%)]">
        <Container className="py-16 md:py-15">
          <div className="min-h-[70vh] grid gap-4 lg:grid-cols-[380px_1fr] items-center lg:gap-12">
            <div className="flex justify-center lg:justify-start order-1">
              <div className="w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[380px]">
                <div className="inline-block md:-rotate-2 rotate-0">
                  <div className="polaroid-frame">
                    <Image
                      src="/images/about.jpg"
                      alt={t("portraitAlt")}
                      width={480}
                      height={600}
                      className="w-full h-auto object-cover rounded-sm"
                      style={{
                        filter: "saturate(0.95) contrast(0.98) brightness(1.02)",
                      }}
                      priority
                    />
                  </div>
                </div>
                <p className="mt-3 text-center text-xs text-deep/40">{t("portraitCaption")}</p>
              </div>
            </div>
            <div className="space-y-6 order-2 max-w-[720px] lg:justify-self-start">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-deep/50">{t("label")}</p>
                <h1 className="text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-deep/90">
                  {t("title")}
                </h1>
                <div className="space-y-2 text-[13px] md:text-[15px] leading-relaxed text-deep/75">
                  <p>{t("paragraph1")}</p>
                  <p>{t("paragraph2")}</p>
                  <p>{t("paragraph3")}</p>
                </div>
              </div>

              <div className="space-y-3 border-t border-deep/10 pt-5">
                <h2 className="text-xl md:text-2xl leading-tight text-deep/90">{t("pathTitle")}</h2>
                <ul className="list-disc pl-4 space-y-1.5 text-[13px] md:text-[15px] leading-relaxed text-deep/70 marker:text-deep/30">
                  {pathItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-deep/10 pt-5">
                <p className="text-[13px] md:text-[15px] leading-relaxed text-deep/70">
                  {t("catNote")}
                </p>
              </div>

              <div className="space-y-3 border-t border-deep/10 pt-5">
                <h2 className="text-xl md:text-2xl leading-tight text-deep/90">{t("thingsTitle")}</h2>
                <div className="flex flex-wrap gap-2">
                  {lovedItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-deep/10 px-3 py-1 text-[12px] text-deep/60"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#fbf3f4]">
        <Container className="py-16 md:py-20">
          <div className="text-center">
            <div className="mx-auto max-w-[640px] space-y-3">
              <h2 className="text-2xl md:text-3xl text-deep/90">{t("stayInTouchTitle")}</h2>
              <p className="text-[13px] md:text-sm text-deep/70 leading-relaxed">
                {t("stayInTouchDescription")}
              </p>
            </div>
            <SubscribeForm className="mt-6" buttonLabel={t("stayInTouchButton")} />
          </div>
        </Container>
      </section>
    </>
  );
}
