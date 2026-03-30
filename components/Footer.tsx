import {Instagram, Pin, Send, Youtube} from "lucide-react";
import {useTranslations} from "next-intl";
import Container from "@/components/Container";
import {Link} from "@/i18n/navigation";

const navLinks = [
  {href: "/", key: "home"},
  {href: "/shop", key: "shop"},
  {href: "/blog", key: "blog"},
  {href: "/about", key: "about"},
  {href: "/faq", key: "faq"},
  {href: "/contact", key: "contact"},
];

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

const linkClassName =
  "relative text-sm text-deep/70 transition-colors duration-200 hover:text-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9]";
const underlineFadeClassName =
  "after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:bg-deep/35 after:opacity-0 after:transition-opacity after:duration-200 hover:after:opacity-100";
const stripBaseClassName =
  "text-[11.5px] uppercase tracking-[0.3em] font-light text-[#2b5968]/70";
const stripLinkClassName =
  "text-[11.5px] uppercase tracking-[0.3em] font-light text-[#2b5968]/70 transition-opacity duration-200 hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7dce0]";

export default function Footer() {
  const t = useTranslations("Footer");
  const nav = useTranslations("Navigation");

  return (
    <div className="footer-fade">
      <section className="bg-[#dfc2c0]/20 border-t border-[#cabab1]/40 text-[#2b5968]/70">
        <Container className="py-2">
          <div className="flex items-center justify-center text-center">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className={stripBaseClassName}>{t("supportMe")}</span>
              <span className="text-[11.5px] uppercase tracking-[0.3em] font-light text-[#2b5968]/45" aria-hidden="true">
                {" · "}
              </span>
              <Link
                href={process.env.NEXT_PUBLIC_PATREON_URL ?? "#"}
                className={stripLinkClassName}
                target="_blank"
                rel="noopener noreferrer"
              >
                Patreon
              </Link>
              <span className={`inline-flex items-center gap-2 ${stripBaseClassName}`}>
                <svg
                  className="inline-block align-middle"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="footer-support-heart-gradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#f6e6a8" />
                      <stop offset="100%" stopColor="#a8c7e8" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 20.6c-3.6-3.1-6.6-5.9-8.2-8.3C2 9.9 2.6 7.2 4.6 5.8c1.7-1.2 4.1-0.9 5.6 0.7L12 8.3l1.8-1.8c1.5-1.6 3.9-1.9 5.6-0.7 2 1.4 2.6 4.1 0.8 6.5-1.6 2.4-4.6 5.2-8.2 8.3z"
                    fill="url(#footer-support-heart-gradient)"
                    stroke="#cabab1"
                    strokeWidth="0.6"
                    strokeOpacity="0.6"
                  />
                </svg>
                {t("supportUkraine")}
              </span>
              <span className="text-[11.5px] uppercase tracking-[0.3em] font-light text-[#2b5968]/45" aria-hidden="true">
                {" · "}
              </span>
              <Link
                href="https://u24.gov.ua/"
                className={stripLinkClassName}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("united24")}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <footer
        id="footer"
        className="bg-[linear-gradient(180deg,#fbf3f4_0%,#fdf8f8_60%,#fdf9f9_100%)] text-deep/80"
      >
        <Container className="py-24 md:py-28">
          <div className="grid gap-12 md:grid-cols-[1fr_1fr_1fr]">
            <div className="space-y-4 text-center md:text-left">
              <div>
                <p className="text-[22px] font-script text-deep/85">Teti Betti</p>
                <div className="mt-3 h-px w-12 bg-deep/15 mx-auto md:mx-0" />
              </div>
              <p className="text-sm text-deep/65">{t("tagline")}</p>
            </div>

            <div className="text-center md:text-center">
              <p className="text-xs uppercase tracking-[0.28em] text-deep/70">{t("navigate")}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 justify-items-center">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`${linkClassName} ${underlineFadeClassName}`}
                  >
                    {nav(link.key)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-xs uppercase tracking-[0.28em] text-deep/70">{t("connect")}</p>
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

          <div className="mt-6 pt-8 border-t border-deep/10/60 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-deep/60">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link href="/privacy" className={`${linkClassName} ${underlineFadeClassName}`}>
                {t("privacy")}
              </Link>
              <span className="text-deep/40">{"·"}</span>
              <Link href="/terms" className={`${linkClassName} ${underlineFadeClassName}`}>
                {t("terms")}
              </Link>
              <span className="text-deep/40">{"·"}</span>
              <Link href="/license" className={`${linkClassName} ${underlineFadeClassName}`}>
                {t("license")}
              </Link>
            </div>
            <div className="text-center md:text-right space-y-1 text-deep/60">
              <p>{t("madeInUkraine")}</p>
              <p>{t("copyright")}</p>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
