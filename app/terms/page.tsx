import LegalLayout from "@/components/LegalLayout";

const sections = [
  {
    title: "Use of the website",
    content: (
      <div className="space-y-3">
        <p>
          By accessing this website, you agree to use it in a respectful and
          lawful manner. You may browse, read, and download materials for
          personal use in accordance with these terms.
        </p>
      </div>
    ),
  },
  {
    title: "Digital products",
    content: (
      <div className="space-y-3">
        <p>
          Digital products provided on this website are delivered as downloads
          or access links. They are offered “as is” and intended for personal
          use unless otherwise stated.
        </p>
      </div>
    ),
  },
  {
    title: "Personal use",
    content: (
      <div className="space-y-3">
        <p>
          You may use the products for your own personal or internal purposes.
          Redistribution, resale, or public sharing is not permitted without
          written permission.
        </p>
      </div>
    ),
  },
  {
    title: "Intellectual property",
    content: (
      <div className="space-y-3">
        <p>
          All content, designs, and digital products on this website are the
          intellectual property of Teti Betti unless otherwise noted. You may
          not copy, reproduce, or create derivative works without permission.
        </p>
      </div>
    ),
  },
  {
    title: "Limitation of liability",
    content: (
      <div className="space-y-3">
        <p>
          The website and products are provided without warranties of any kind.
          Teti Betti is not liable for any direct or indirect damages resulting
          from use of the website or digital products.
        </p>
      </div>
    ),
  },
  {
    title: "Changes to the terms",
    content: (
      <div className="space-y-3">
        <p>
          These terms may be updated from time to time. Continued use of the
          website after updates means you accept the revised terms.
        </p>
      </div>
    ),
  },
  {
    title: "Contact",
    content: (
      <div className="space-y-3">
        <p>
          If you have questions about these terms, please contact{" "}
          <a
            href="mailto:support@tetibetti.com"
            className="text-deep/85 hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7dce0]"
          >
            support@tetibetti.com
          </a>
          .
        </p>
      </div>
    ),
  },
];

export default function Page() {
  return (
    <LegalLayout
      label="TERMS"
      title="Terms of Use"
      updatedLabel="Last updated: March 2026"
      intro={
        <p>
          These terms describe the rules and conditions for using this website
          and accessing the digital products provided here.
        </p>
      }
    >
      {sections.map((section, index) => (
        <section
          key={section.title}
          className={index === 0 ? "space-y-3" : "space-y-3 border-t border-deep/10 pt-6"}
        >
          <h2 className="text-lg md:text-xl text-deep/85">{section.title}</h2>
          <div className="text-[13px] md:text-[15px] leading-relaxed text-deep/70">
            {section.content}
          </div>
        </section>
      ))}
    </LegalLayout>
  );
}

