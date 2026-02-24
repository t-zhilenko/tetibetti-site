import Container from "@/components/Container";
import Accordion, { type AccordionItem } from "@/components/Accordion";
import ProductGallery from "@/components/ProductGallery";
import ProductInfoPanel from "@/components/ProductInfoPanel";
import SubscribeForm from "@/components/SubscribeForm";

type Product = {
  title: string;
  priceLabel: string;
  summary: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  meta: string[];
  images: { src: string; alt?: string }[];
  sections: AccordionItem[];
  subscribeTag?: string;
};

const product: Product = {
  title: "Yearly Goals (Notion Template)",
  priceLabel: "Free",
  summary:
    "A calm, minimalist Notion workspace for yearly planning. Map priorities, track progress, and keep your goals visible without noise.",
  ctaLabel: "Download Free",
  ctaHref: "#",
  meta: ["Instant download", "Notion template", "Minimal design"],
  images: [
    {
      src: "/images/yearly-goals-preview.svg",
      alt: "Yearly Goals Notion template preview",
    },
  ],
  sections: [
    {
      id: "product-info",
      title: "Product info",
      defaultOpen: true,
      content: (
        <div>
          <p>
            Designed for quiet focus and structured reflection. Plan the year in
            one view, then zoom into monthly milestones without breaking flow.
          </p>
          <p>
            Built with clean sections, soft color accents, and a gentle rhythm so
            the template stays out of your way.
          </p>
          <p>
            Use it as a yearly reset or a gentle companion for ongoing review.
          </p>
        </div>
      ),
    },
    {
      id: "whats-inside",
      title: "What's inside",
      content: (
        <ul>
          <li>Year overview dashboard</li>
          <li>Goal tracker with quarterly checkpoints</li>
          <li>Monthly review prompts</li>
          <li>Simple habit and project boards</li>
          <li>Focused notes for wins and learnings</li>
        </ul>
      ),
    },
    {
      id: "faq",
      title: "FAQ",
      content: (
        <div>
          <p>
            <span className="font-medium text-deep/80">Do I need Notion Pro?</span>
            <br />
            No. The template works with the free plan.
          </p>
          <p>
            <span className="font-medium text-deep/80">Can I customize it?</span>
            <br />
            Yes. Duplicate and adjust sections to match your workflow.
          </p>
          <p>
            <span className="font-medium text-deep/80">Is this a one-time download?</span>
            <br />
            Yes. You will get an instant duplicate link for your workspace.
          </p>
          <p>
            <span className="font-medium text-deep/80">Can I share it with my team?</span>
            <br />
            Please keep it personal and invite teammates to your workspace instead.
          </p>
        </div>
      ),
    },
    {
      id: "terms",
      title: "License / terms",
      content: (
        <div>
          <p>Digital product. No refunds after download.</p>
          <p>For personal use only. Please don't resell or redistribute.</p>
          <p>You may customize for your own workflow.</p>
        </div>
      ),
    },
  ],
  subscribeTag: "yearly-goals",
};

export default function Page() {
  return (
    <section className="bg-[#fdf9f9]">
      <Container className="pt-10 pb-16 md:pt-14 md:pb-24">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.95fr] items-start">
          <ProductGallery images={product.images} title={product.title} />
          <div className="space-y-8">
            <ProductInfoPanel
              title={product.title}
              priceLabel={product.priceLabel}
              summary={product.summary}
              ctaLabel={product.ctaLabel}
              ctaHref={product.ctaHref}
              secondaryCtaLabel={product.secondaryCtaLabel}
              secondaryCtaHref={product.secondaryCtaHref}
              meta={product.meta}
            />
            <Accordion items={product.sections} />
          </div>
        </div>
      </Container>
      <div
        id="product-updates"
        className="mt-8 md:mt-12 bg-[#dfc2c0]/18 border-y border-[#cabab1]/35"
      >
        <Container className="py-12 md:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[11px] uppercase tracking-[0.32em] text-deep/45">
              Get updates by email
            </p>
            <p className="mt-3 text-sm text-deep/60 leading-relaxed">
              New releases, updates, and early-subscriber discounts. No spam.
            </p>
            <SubscribeForm
              tag={product.subscribeTag}
              className="mt-6 max-w-[560px]"
            />
          </div>
        </Container>
      </div>
    </section>
  );
}
