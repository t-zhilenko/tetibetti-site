import {permanentRedirect} from "next/navigation";
import {resolveLocale} from "@/i18n/locale";

type ProductsPageProps = {
  params: Promise<{locale: string}>;
};

export default async function ProductsPage({params}: ProductsPageProps) {
  const locale = await resolveLocale(params);
  permanentRedirect(`/${locale ?? "en"}/shop`);
}
