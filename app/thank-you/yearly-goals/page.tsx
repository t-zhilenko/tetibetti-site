import Container from "@/components/Container";

export default function Page() {
  return (
    <section className="bg-[#fdf9f9]">
      <Container className="py-14 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="py-4 md:py-6 space-y-4">
            <p className="text-[11px] uppercase tracking-[0.38em] text-deep/50">
              Check your inbox
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold text-deep/95">
              Check your inbox {"\uD83E\uDD0D"}
            </h1>
            <p className="text-[13px] md:text-sm text-deep/80 leading-relaxed">
              Your template link and setup instructions are on the way.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#cabab1]/25 text-center text-[12.5px] md:text-sm text-deep/60 leading-relaxed">
            <p className="text-[11px] uppercase tracking-[0.3em] text-deep/50">
              Didn't receive the email?
            </p>
            <p className="mt-4">
              If you don't see it in a minute, check your Promotions or Spam
              folder.
            </p>
            <p className="mt-4">
              Still nothing? You can always reach us at{" "}
              <a
                href="mailto:support@tetibetti.com"
                className="inline-flex items-center gap-1 text-deep/85 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7dce0]"
              >
                <span aria-hidden="true">✉</span>
                support@tetibetti.com
              </a>
              .
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
