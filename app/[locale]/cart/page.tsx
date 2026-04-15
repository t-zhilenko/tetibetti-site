import {notFound} from "next/navigation";
import CartPageClient from "@/components/cart/CartPageClient";
import {resolveLocale} from "@/i18n/locale";

type CartPageProps = {
  params: Promise<{locale: string}>;
};

export default async function CartPage({params}: CartPageProps) {
  const locale = await resolveLocale(params);
  if (!locale) {
    notFound();
  }

  return <CartPageClient />;
}
