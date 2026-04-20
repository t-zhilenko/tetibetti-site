import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import { getDb } from "@/lib/server/db";
import {
  findOrderByDeliveryTokenHash,
  touchDeliveryTokenUsedAt,
} from "@/lib/server/repositories/deliveryTokens";
import { isUuid, sha256Hex } from "@/lib/server/security";
import { getSupportEmail } from "@/lib/server/support";

type AccessPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccessPage({ params }: AccessPageProps) {
  const { token } = await params;
  const normalizedToken = token.trim();
  const supportEmail = getSupportEmail();

  if (!normalizedToken || !isUuid(normalizedToken)) {
    return (
      <section className="bg-soft min-h-[70vh]">
        <Container className="py-16">
          <div className="max-w-2xl space-y-4 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
            <h1 className="text-3xl text-deep/90">Access link is invalid</h1>
            <p className="text-sm text-deep/70">
              This link is not valid. Request a new access email or contact support.
            </p>
            <p className="text-sm text-deep/70">
              <a href={`mailto:${supportEmail}`} className="underline">
                {supportEmail}
              </a>
            </p>
          </div>
        </Container>
      </section>
    );
  }

  const db = await getDb();
  const access = await findOrderByDeliveryTokenHash(db, sha256Hex(normalizedToken));

  if (!access) {
    return (
      <section className="bg-soft min-h-[70vh]">
        <Container className="py-16">
          <div className="max-w-2xl space-y-4 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
            <h1 className="text-3xl text-deep/90">This access link is no longer active</h1>
            <p className="text-sm text-deep/70">
              It may be expired, revoked, or incorrect. You can request a new access email.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/order/lookup"
                className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/50 bg-[#dfc2c0]/75 px-5 text-sm text-deep"
              >
                Find my order
              </Link>
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex h-11 items-center rounded-full border border-[#dfc2c0]/50 px-5 text-sm text-deep/80"
              >
                Contact support
              </a>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  await touchDeliveryTokenUsedAt(db, access.token.id);

  const isPaidOrder = access.orderStatus === "paid";
  const canOpenProduct = isPaidOrder && Boolean(access.productTargetUrl);

  return (
    <section className="bg-soft min-h-[70vh]">
      <Container className="py-16">
        <div className="max-w-2xl space-y-6 rounded-3xl border border-[#dfc2c0]/30 bg-white/75 p-8">
          <div className="space-y-2">
            <h1 className="text-3xl text-deep/90">{access.productName}</h1>
            <p className="text-sm text-deep/70">
              Your access has been verified. Keep this page private.
            </p>
          </div>

          {canOpenProduct ? (
            <a
              href={access.productTargetUrl ?? undefined}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex h-12 items-center rounded-full border border-[#dfc2c0]/55 bg-[#dfc2c0]/78 px-6 text-sm text-deep"
            >
              Open template / access product
            </a>
          ) : (
            <p className="text-sm text-deep/70">
              Access is verified, but the destination is not configured yet. Contact support and we
              will help you immediately.
            </p>
          )}

          <div className="space-y-2 text-sm text-deep/70">
            <p>Usage tips:</p>
            <p>1. Open the link above and duplicate/add the template to your workspace.</p>
            <p>2. Keep your access email for future reference.</p>
            <p>3. If anything looks wrong, contact support.</p>
          </div>

          <p className="text-sm text-deep/70">
            Support:{" "}
            <a href={`mailto:${supportEmail}`} className="underline">
              {supportEmail}
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
