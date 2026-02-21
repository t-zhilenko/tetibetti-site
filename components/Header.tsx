"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Pin, Search, ShoppingBag, Youtube } from "lucide-react";
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
          <div className="py-4 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex items-center gap-3 text-deep/55">
              <button
                type="button"
                aria-label="Search"
                className="inline-flex hover:text-deep/85"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>
            </div>
            <Link
              href="/"
              className="text-center text-[32px] sm:text-[34px] font-script text-deep/75"
            >
              Teti Betti
            </Link>
            <div className="flex items-center justify-end gap-3 text-deep/55">
              {socialLinks.map((item, index) => (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className={`hover:text-deep/85 ${index === 2 ? "hidden sm:inline-flex" : "inline-flex"}`}
                >
                  <item.Icon size={16} strokeWidth={1.5} />
                </Link>
              ))}
              <button
                type="button"
                aria-label="Cart"
                className="relative inline-flex hover:text-deep/85"
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-deep/55" />
              </button>
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-beige/32 border-y border-deep/10">
        <Container>
          <div className="min-h-[48px] md:min-h-[54px] py-2 flex items-center">
            <nav className="mx-auto flex flex-wrap items-center justify-center gap-6 text-xs uppercase tracking-[0.25em]">
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
            <div className="ml-4 flex shrink-0 items-center">
              <span className="text-[11px] uppercase tracking-[0.2em] border border-deep/20 rounded-full px-3 py-1 text-deep/70">
                UK | EN
              </span>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
