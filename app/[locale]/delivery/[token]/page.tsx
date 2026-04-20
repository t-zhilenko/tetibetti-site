import type { Metadata } from "next";
import { redirect } from "next/navigation";

type DeliveryTokenPageProps = {
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

export default async function DeliveryTokenPage({ params }: DeliveryTokenPageProps) {
  const { token } = await params;
  redirect(`/access/${encodeURIComponent(token)}`);
}
