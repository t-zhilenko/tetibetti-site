import Container from "@/components/Container";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-soft bg-[radial-gradient(900px_420px_at_80%_85%,rgba(223,194,192,0.08),transparent_70%)]">
      <Container className="py-16 md:py-15">
        <div className="min-h-[70vh] grid gap-4 lg:grid-cols-[420px_1fr] items-center lg:gap-10">
          <div className="flex justify-center lg:justify-start order-1">
            <div className="w-full max-w-[240px] sm:max-w-[280px] lg:w-[420px] lg:max-w-none">
              <div className="aspect-[3/4] w-full rounded-3xl bg-beige/35 border border-deep/10" />
            </div>
          </div>
          <div className="space-y-5 order-2 max-w-[560px] lg:justify-self-start">
            <p className="text-xs uppercase tracking-[0.3em] text-deep/50">
              Digital systems & reflections
            </p>
            <h1 className="text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] max-w-xl">
              Structure for clarity.{" "}
              <span className="text-deep/90">Space for becoming.</span>
            </h1>
            <p className="max-w-md text-[13px] md:text-[15px] leading-relaxed text-deep/75">
              I build thoughtful systems and write about purpose, growth and
              alignment — creating minimal tools to support the process.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-blush/80 px-5 py-2.5 text-sm font-medium text-deep border border-deep/10 shadow-sm"
              >
                View products
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full border border-deep/40 px-5 py-2.5 text-sm font-medium text-deep/75 hover:text-deep"
              >
                Read blog
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
