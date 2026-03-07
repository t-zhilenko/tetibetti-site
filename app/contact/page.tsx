import Container from "@/components/Container";
import SupportForm from "@/components/SupportForm";

export default function Page() {
  return (
    <section className="bg-[#fdf9f9]">
      <Container className="py-16 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] items-start">
          <div className="space-y-4 max-w-[520px]">
            <p className="text-[11px] uppercase tracking-[0.35em] text-deep/50">
              CONTACT
            </p>
            <h1 className="text-3xl md:text-4xl leading-[1.12] tracking-[-0.02em] text-deep/90">
              Say hello
            </h1>
            <div className="space-y-3 text-[13px] md:text-[15px] leading-relaxed text-deep/70">
              <p>
                If you&apos;d like to ask a question, share an idea, or simply say
                hello, I&apos;d love to hear from you.
              </p>
              <p>
                You can send me a message here, or write directly to{" "}
                <a
                  href="mailto:support@tetibetti.com"
                  className="text-deep/85 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7dce0]"
                >
                  support@tetibetti.com
                </a>
                .
              </p>
            </div>
            <p className="text-[12px] text-deep/55">
              I usually reply as soon as I can.
            </p>
          </div>
          <div className="w-full max-w-[560px] lg:mt-[46px]">
            <SupportForm
              productSlug="contact"
              variant="inline"
              rows={4}
              analyticsEvent={{
                name: "contact message sent",
                properties: {
                  source: "contact_page",
                  form_type: "contact",
                },
              }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

