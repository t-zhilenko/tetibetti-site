import LegalLayout from "@/components/LegalLayout";

const sections = [
  {
    title: "Information I collect",
    content: (
      <div className="space-y-3">
        <p>
          When you send a message through the contact form, I collect the
          information you provide, such as your email address and the content of
          your message.
        </p>
        <p>
          The website may also collect basic usage information, such as page
          visits or device data, through cookies or analytics tools.
        </p>
      </div>
    ),
  },
  {
    title: "How your information is used",
    content: (
      <div className="space-y-3">
        <p>
          Your information is used to respond to your messages, provide support,
          and improve the website experience.
        </p>
        <p>I do not sell or rent personal information.</p>
      </div>
    ),
  },
  {
    title: "Email communications",
    content: (
      <div className="space-y-3">
        <p>
          If you contact me, I will reply to the email address you provide. You
          will only receive emails related to your request unless you have opted
          into updates.
        </p>
        <p>You can request removal from communications at any time.</p>
      </div>
    ),
  },
  {
    title: "Cookies and analytics",
    content: (
      <div className="space-y-3">
        <p>
          Cookies may be used to keep the website running smoothly and to
          understand how visitors use the site.
        </p>
        <p>
          You can disable cookies in your browser settings, though some features
          may not work as intended.
        </p>
      </div>
    ),
  },
  {
    title: "Third-party services",
    content: (
      <div className="space-y-3">
        <p>
          I may use trusted third-party services for hosting, email delivery, or
          analytics. These services receive only the information needed to
          perform their functions.
        </p>
      </div>
    ),
  },
  {
    title: "Data protection",
    content: (
      <div className="space-y-3">
        <p>
          Reasonable safeguards are used to protect your information, but no
          online system can guarantee complete security.
        </p>
      </div>
    ),
  },
  {
    title: "Your rights",
    content: (
      <div className="space-y-3">
        <p>
          You may request access to, correction of, or deletion of your personal
          information at any time.
        </p>
      </div>
    ),
  },
  {
    title: "Contact",
    content: (
      <div className="space-y-3">
        <p>
          If you have any questions about this policy, please contact me at{" "}
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
      label="PRIVACY POLICY"
      title="Privacy Policy"
      updatedLabel="Last updated: March 2026"
      intro={
        <p>
          This page explains what information is collected on this website, how
          it is used, and how it is protected.
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

