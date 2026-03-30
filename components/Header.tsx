"use client";

import {Instagram, Pin, Search, ShoppingBag, Youtube, Send} from "lucide-react";
import {useLocale, useTranslations} from "next-intl";
import Container from "@/components/Container";
import {routing, type Locale} from "@/i18n/routing";
import {Link, usePathname, useRouter} from "@/i18n/navigation";

const socialLinks = [
  {
    href: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "#",
    label: "Instagram",
    Icon: Instagram,
  },
  {
    href: process.env.NEXT_PUBLIC_YOUTUBE_URL ?? "#",
    label: "YouTube",
    Icon: Youtube,
  },
  {
    href: process.env.NEXT_PUBLIC_PINTEREST_URL ?? "#",
    label: "Pinterest",
    Icon: Pin,
  },
  {
    href: process.env.NEXT_PUBLIC_TELEGRAM_URL ?? "#",
    label: "Telegram",
    Icon: Send,
  },
];

const navLinks = [
  {href: "/", key: "home"},
  {href: "/shop", key: "shop"},
  {href: "/blog", key: "blog"},
  {href: "/about", key: "about"},
  {href: "/faq", key: "faq"},
  {href: "/contact", key: "contact"},
];

export default function Header() {
  const t = useTranslations("Navigation");
  const common = useTranslations("Common");
  const pathname = usePathname();
  const locale = useLocale() as Locale;
  const router = useRouter();

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
                aria-label={common("search")}
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
                  className={`hover:text-deep/85 ${
                    index === 2 ? "hidden sm:inline-flex" : "inline-flex"
                  }`}
                >
                  <item.Icon size={16} strokeWidth={1.5} />
                </Link>
              ))}
              <button
                type="button"
                aria-label={common("cart")}
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
          <div className="min-h-[48px] md:min-h-[54px] py-2 flex items-center justify-between gap-4">
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
                  {t(link.key)}
                </Link>
              ))}
            </nav>
            <div className="flex items-center justify-end">
              <div className="inline-flex items-center gap-1 rounded-full bg-white/55 p-1 border border-deep/10">
                {routing.locales.map((value) => {
                  const isCurrent = locale === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => router.replace(pathname, {locale: value})}
                      className={`rounded-full px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase transition-colors ${
                        isCurrent
                          ? "bg-blush/70 text-deep/85"
                          : "text-deep/55 hover:text-deep/75"
                      }`}
                      aria-pressed={isCurrent}
                      aria-label={value === "en" ? common("switchToEnglish") : common("switchToUkrainian")}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </div>
    </header>
  );
}
