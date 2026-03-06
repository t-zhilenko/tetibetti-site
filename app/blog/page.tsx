import Container from "@/components/Container";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <section className="relative overflow-hidden bg-soft bg-[radial-gradient(900px_420px_at_80%_85%,rgba(223,194,192,0.08),transparent_70%)]">
      <Container className="py-16 md:py-15">
        <div className="min-h-[70vh] grid gap-4 lg:grid-cols-[380px_1fr] items-center lg:gap-12">
          <div className="flex justify-center lg:justify-start order-1">
            <div className="w-full max-w-[260px] sm:max-w-[320px] lg:max-w-[380px]">
              <div className="inline-block md:-rotate-2 rotate-0">
                <div className="polaroid-frame">
                  <Image
                    src="/images/blog.png"
                    alt="Blog illustration"
                    width={480}
                    height={600}
                    className="w-full h-auto object-cover rounded-sm"
                    style={{
                      filter: "saturate(0.95) contrast(0.98) brightness(1.02)",
                    }}
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-5 order-2 max-w-[720px] lg:justify-self-start">
            <p className="text-xs uppercase tracking-[0.3em] text-deep/50">
              BLOG
            </p>
            <h1 className="text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-deep/90">
              The blog is taking shape
            </h1>
            <div className="space-y-3 text-[13px] md:text-[15px] leading-relaxed text-deep/75">
              <p>
                I&apos;m preparing a space for essays about digital systems,
                thoughtful productivity, and the quiet process of building
                things.
              </p>
            </div>
            <div className="space-y-1 text-[12px] md:text-[13px] text-deep/55">
              <p className="text-[12px] tracking-[0.26em] text-deep/45">
                ✦ Coming soon
              </p>
              <p>First writings arriving in April 2026</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center rounded-full bg-blush/80 px-5 py-2.5 text-sm font-medium text-deep border border-deep/10 shadow-sm"
              >
                View products
              </Link>
              <Link
                href="#footer"
                className="inline-flex items-center justify-center rounded-full border border-deep/40 px-5 py-2.5 text-sm font-medium text-deep/75 hover:text-deep"
              >
                Find me online
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

