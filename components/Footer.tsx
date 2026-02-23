import Link from "next/link";
import { Instagram, Pin, Send, Youtube } from "lucide-react";
import Container from "@/components/Container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

const socialLinks = [
  { href: "#", label: "Instagram", Icon: Instagram },
  { href: "#", label: "YouTube", Icon: Youtube },
  { href: "#", label: "Pinterest", Icon: Pin },
  { href: "#", label: "Telegram", Icon: Send },
];

const linkClassName =
  "relative text-sm text-deep/70 transition-colors duration-200 hover:text-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9]";
const underlineFadeClassName =
  "after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-deep/35 after:opacity-0 after:transition-opacity after:duration-200 hover:after:opacity-100";
const supportLinkClassName =
  "text-xs text-deep/60 transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9]";

export default function Footer() {
  return (
    <footer className="footer-fade bg-[linear-gradient(180deg,#fbf3f4_0%,#fdf8f8_60%,#fdf9f9_100%)] text-deep/80">
      <Container className="py-24 md:py-28">
        <div className="grid gap-12 md:grid-cols-[1fr_1fr_1fr]">
          <div className="space-y-4 text-center md:text-left">
            <div>
              <p className="text-[22px] font-script text-deep/85">Teti Betti</p>
              <div className="mt-3 h-px w-12 bg-deep/15 mx-auto md:mx-0" />
            </div>
            <p className="text-sm text-deep/65">
              Digital systems & thoughtful reflections.
            </p>
          </div>

          <div className="text-center md:text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-deep/70">
              Navigate
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 justify-items-center">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${linkClassName} ${underlineFadeClassName}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs uppercase tracking-[0.28em] text-deep/70">
              Connect
            </p>
            <div className="mt-4 flex items-center justify-center md:justify-end gap-4">
              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="text-deep/70 transition-all duration-200 hover:text-deep hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9]"
                >
                  <item.Icon size={18} strokeWidth={1.5} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 text-xs text-deep/55 md:flex-row md:items-center md:justify-between">
          <p className="text-center md:text-left">
            Support me:{" "}
            <Link href="#" className={supportLinkClassName}>
              Patreon
            </Link>
          </p>
          <p className="text-center md:text-right">
            Support Ukraine:{" "}
            <Link href="#" className={supportLinkClassName}>
              Sternenko
            </Link>{" "}
            <span className="text-deep/40">{"\u00b7"}</span>{" "}
            <Link href="#" className={supportLinkClassName}>
              Come Back Alive
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-8 border-t border-deep/10/60 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-deep/60">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/privacy"
              className={`${linkClassName} ${underlineFadeClassName}`}
            >
              Privacy Policy
            </Link>
            <span className="text-deep/40">{"\u00b7"}</span>
            <Link
              href="/terms"
              className={`${linkClassName} ${underlineFadeClassName}`}
            >
              Terms & Conditions
            </Link>
          </div>
          <div className="text-center md:text-right space-y-1 text-deep/60">
            <p>Made in Ukraine with love</p>
            <p>(c) 2026 Teti Betti. All rights reserved.</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}