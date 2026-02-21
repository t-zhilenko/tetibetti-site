import Container from "@/components/Container";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-soft bg-[radial-gradient(900px_420px_at_80%_85%,rgba(223,194,192,0.08),transparent_70%)]">
      <Container className="py-16 md:py-15">
        <div className="min-h-[70vh] grid gap-4 lg:grid-cols-[380px_1fr] items-center lg:gap-12">
          <div className="flex justify-center lg:justify-start order-1">
            <div className="w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[380px]">
              <div className="inline-block md:-rotate-2 rotate-0">
                <div className="polaroid-frame">
                  <Image
                    src="/images/hero-portrait.png"
                    alt="Tatiana – Founder of Teti Betti"
                    width={480}
                    height={600}
                    className="w-full h-auto object-cover rounded-sm"
                    style={{
                      filter: "saturate(0.90) contrast(0.98) brightness(1.03)",
                    }}
                    priority
                  />
                </div>
              </div>
              <p className="mt-3 text-center text-xs tracking-wide text-deep/40">
                Tetiana • Teti Betti
              </p>
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
