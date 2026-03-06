import Accordion, { type AccordionItem } from "@/components/Accordion";
import Container from "@/components/Container";
import SupportForm from "@/components/SupportForm";
import Image from "next/image";

const faqItems: AccordionItem[] = [
  {
    id: "products",
    title: "What are these products?",
    content: (
      <p>
        They are digital templates, planners, and simple systems designed to
        help you organize your ideas, routines, and projects with more clarity.
      </p>
    ),
  },
  {
    id: "delivery",
    title: "How do I receive the product?",
    content: (
      <p>
        After checkout, you will receive an email with a download link. The
        download is also available on the success page right after purchase.
      </p>
    ),
  },
  {
    id: "notion",
    title: "Do I need Notion to use the templates?",
    content: (
      <p>
        Notion templates require a free Notion account. If a product is a PDF or
        printable, you can use it without Notion.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Can I share the template with others?",
    content: (
      <p>
        Please keep downloads for personal use only. If someone you know wants a
        copy, sending them the product link is the best way to support the work.
      </p>
    ),
  },
  {
    id: "missing-email",
    title: "I didn't receive the email",
    content: (
      <p>
        Check your spam or promotions folder first, and make sure the email
        address was entered correctly. If it still does not arrive, send me a
        message and I will help right away.
      </p>
    ),
  },
  {
    id: "paid-products",
    title: "Are paid products coming?",
    content: (
      <p>
        Yes, I am preparing a small collection of paid templates and guides.
        Updates will appear on the shop page as they are ready.
      </p>
    ),
  },
  {
    id: "requests",
    title: "Can I request a feature or template?",
    content: (
      <p>
        Absolutely. Send me a short message with what you need and how you plan
        to use it. I read every note.
      </p>
    ),
  },
];

export default function Page() {
  return (
    <>
      <section className="bg-[#fdf9f9]">
        <Container className="py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] items-start">
            <div className="space-y-5">
              <p className="text-[11px] uppercase tracking-[0.35em] text-deep/50">
                FAQ
              </p>
              <h1 className="text-3xl md:text-4xl leading-[1.12] tracking-[-0.02em] text-deep/90">
                Questions &amp; answers
              </h1>
              <p className="text-[13px] md:text-[15px] leading-relaxed text-deep/70 max-w-[420px]">
                Here you&apos;ll find answers to common questions about downloads,
                Notion templates, and how everything works.
              </p>
              <div className="mt-8 flex flex-col items-start gap-2 max-w-[360px] sm:max-w-[440px] lg:max-w-[470px]">
                <div className="relative w-full flex justify-center">
                  <Image
                    src="/images/faq.png"
                    alt="Varya the cat"
                    width={520}
                    height={520}
                    className="varya-tilt w-full h-auto object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.08)]"
                    priority
                  />
                </div>
                <p className="w-full text-center text-[11px] text-deep/45 tracking-[0.02em]">
                  Varya is supervising the support department.
                </p>
              </div>
            </div>
            <div className="lg:pt-2">
              <Accordion items={faqItems} />
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#fbf3f4] border-t border-deep/10">
        <Container className="py-16 md:py-20">
          <div className="mx-auto max-w-[520px] text-center space-y-4">
            <h2 className="text-2xl md:text-3xl text-deep/90">
              Still have a question?
            </h2>
            <p className="text-[13px] md:text-sm text-deep/70 leading-relaxed">
              Send me a message and I&apos;ll be happy to help.
            </p>
            <div className="mx-auto max-w-[420px] text-left">
              <SupportForm productSlug="faq" variant="inline" />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

