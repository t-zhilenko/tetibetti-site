import Container from "@/components/Container";
import SubscribeForm from "@/components/SubscribeForm";
import {useTranslations} from "next-intl";

export default function EmailSubscription() {
  const t = useTranslations("Home.subscription");

  return (
    <section className="bg-soft">
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-[900px] text-center space-y-5">
          <p className="text-xs uppercase tracking-[0.36em] text-deep/40">
            {t("label")}
          </p>
          <h2 className="text-2xl md:text-3xl">
            {t("title")}
          </h2>
          <p className="text-[13px] md:text-sm text-deep/70 leading-relaxed">
            {t("descriptionLine1")}
            <br />
            {t("descriptionLine2")}
          </p>
          <p className="mt-3 text-[12px] text-deep/45">
            {t("caption")}
          </p>
        </div>
        <SubscribeForm buttonLabel={t("button")} />
      </Container>
    </section>
  );
}
