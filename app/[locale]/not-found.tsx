import {useTranslations} from "next-intl";
import Container from "@/components/Container";
import {Link} from "@/i18n/navigation";

export default function LocaleNotFoundPage() {
  const t = useTranslations("Pages.notFound");

  return (
    <section className="bg-soft">
      <Container className="py-20">
        <div className="max-w-xl space-y-4 text-center mx-auto">
          <h1 className="text-3xl md:text-4xl text-deep/90">{t("title")}</h1>
          <p className="text-sm text-deep/70">{t("description")}</p>
          <Link href="/" className="text-sm text-deep/70 underline underline-offset-4">
            {t("goHome")}
          </Link>
        </div>
      </Container>
    </section>
  );
}
