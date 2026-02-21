"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "@/components/Container";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header>
      <div className="bg-[#fbf7f6] border-b border-deep/10">
        <Container>
          <div className="py-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div />
            <Link
              href="/"
              className="text-center text-[32px] sm:text-[34px] font-script text-deep/75"
            >
              Teti Betti
            </Link>
            <div className="flex justify-end">
              <span className="text-[11px] uppercase tracking-[0.2em] border border-deep/20 rounded-full px-3 py-1">
                UK | EN
              </span>
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-beige/32 border-y border-deep/10">
        <Container>
          <nav className="h-[48px] md:h-[54px] flex items-center justify-center gap-6 flex-wrap text-xs uppercase tracking-[0.25em]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b border-transparent pb-[2px] ${
                  isActive(link.href)
                    ? "text-deep border-deep/40 font-medium"
                    : "text-deep/60 font-light hover:text-deep hover:border-deep/30"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </header>
  );
}
