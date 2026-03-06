import LegalLayout from "@/components/LegalLayout";

const sections = [
  {
    title: "Personal use",
    content: (
      <div className="space-y-3">
        <p>
          Each product is licensed for personal use. This means you can use it
          for your own projects, planning, and learning, but not for resale or
          public distribution.
        </p>
      </div>
    ),
  },
  {
    title: "What you can do",
    content: (
      <div className="space-y-3">
        <ul className="list-disc pl-5 space-y-2">
          <li>Duplicate the template into your own Notion workspace</li>
          <li>Customize and adapt it for your personal workflows</li>
          <li>Use it for personal organization, learning, and planning</li>
        </ul>
      </div>
    ),
  },
  {
    title: "What you cannot do",
    content: (
      <div className="space-y-3">
        <ul className="list-disc pl-5 space-y-2">
          <li>Resell the template or its content</li>
          <li>Redistribute the template publicly</li>
          <li>Share the template file or duplication link</li>
          <li>Claim the template as your own work</li>
        </ul>
      </div>
    ),
  },
  {
    title: "Sharing with others",
    content: (
      <div className="space-y-3">
        <p>
          If someone you know would benefit from a template, please share the
          product page instead of the file. This supports the work and keeps
          licensing clear for everyone.
        </p>
      </div>
    ),
  },
  {
    title: "Updates",
    content: (
      <div className="space-y-3">
        <p>
          If a product receives updates or improvements, you may receive access
          to the updated version at no additional cost unless stated otherwise.
        </p>
      </div>
    ),
  },
  {
    title: "Contact",
    content: (
      <div className="space-y-3">
        <p>
          If you have questions about this license, please contact{" "}
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
      label="LICENSE"
      title="Product License"
      updatedLabel="Last updated: March 2026"
      intro={
        <p>
          This page explains how the digital products on this website can be
          used after download.
        </p>
      }
    >
      {sections.map((section, index) => (
        <section
          key={section.title}
          className={
            index === 0 ? "space-y-3" : "space-y-3 border-t border-deep/10 pt-6"
          }
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
