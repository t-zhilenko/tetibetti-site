import type { Metadata } from "next";
import AccessPage from "@/app/access/[token]/page";
import { resolveLocale } from "@/i18n/locale";

type LocalizedAccessPageProps = {
  params: Promise<{
    locale: string;
    token: string;
  }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LocalizedAccessPage({ params }: LocalizedAccessPageProps) {
  const { locale, token } = await params;
  const validLocale = await resolveLocale(Promise.resolve({ locale }));
  if (!validLocale) {
    return null;
  }

  return AccessPage({
    params: Promise.resolve({ token }),
  });
}
