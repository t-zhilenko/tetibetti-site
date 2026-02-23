import Container from "@/components/Container";
import SubscribeForm from "@/components/SubscribeForm";

export default function EmailSubscription() {
  return (
    <section className="bg-soft">
      <Container className="py-16 md:py-24">
        <div className="mx-auto max-w-[900px] text-center space-y-5">
          <p className="text-xs uppercase tracking-[0.36em] text-deep/40">
            STAY IN FLOW
          </p>
          <h2 className="text-2xl md:text-3xl">
            Receive quiet updates and new releases.
          </h2>
          <p className="text-[13px] md:text-sm text-deep/70 leading-relaxed">
            I share new tools, reflections, and thoughtful systems.
            <br />
            No noise. Only what matters.
          </p>
          <p className="mt-3 text-[12px] text-deep/45">
            No spam. Unsubscribe anytime.
          </p>
        </div>
        <SubscribeForm />
      </Container>
    </section>
  );
}
