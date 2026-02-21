import Container from "@/components/Container";
import Link from "next/link";

type CheckoutPageProps = {
  searchParams?: {
    product?: string;
  };
};

export default function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const product = searchParams?.product ?? "selected product";

  return (
    <section className="bg-soft">
      <Container className="py-16">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl">Checkout</h1>
          <p className="text-sm text-deep/70">
            A checkout flow will live here. You selected <span className="font-medium text-deep">{product}</span>.
          </p>
          <Link href="/shop" className="text-sm text-deep/70 underline">
            Return to shop
          </Link>
        </div>
      </Container>
    </section>
  );
}
