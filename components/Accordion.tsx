"use client";

import { useMemo, useState, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  title: string;
  label?: string;
  content: ReactNode;
  defaultOpen?: boolean;
};

type AccordionProps = {
  items: AccordionItem[];
  variant?: "card" | "minimal" | "line";
};

export default function Accordion({ items, variant = "card" }: AccordionProps) {
  const initialOpenId = useMemo(() => {
    const found = items.find((item) => item.defaultOpen);
    return found ? found.id : null;
  }, [items]);

  const [openId, setOpenId] = useState<string | null>(initialOpenId);
  const isMinimal = variant === "minimal";
  const isLine = variant === "line";

  const containerClassName = isLine
    ? "rounded-2xl border border-deep/10 bg-white/70 overflow-hidden divide-y divide-deep/10"
    : isMinimal
      ? "space-y-3"
      : "space-y-4";
  const itemClassName = isLine
    ? "bg-transparent"
    : isMinimal
      ? "rounded-2xl border border-[#dfc2c0]/30 bg-white/75 shadow-[0_12px_28px_rgba(43,89,104,0.06)]"
      : "rounded-2xl border border-[#cabab1]/30 bg-white/80 shadow-[0_10px_24px_rgba(43,89,104,0.05)] transition-[background-color,border-color,transform] duration-200 ease-out hover:bg-white/90 hover:border-[#cabab1]/45 hover:-translate-y-[1px]";
  const buttonClassName = isLine
    ? "group w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-deep/5 focus-visible:bg-deep/5"
    : "group w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:text-deep/85 focus-visible:text-deep/85";
  const titleClassName = isLine
    ? "text-[15px] font-medium text-deep/85"
    : isMinimal
      ? "text-[15px] font-medium text-deep/85"
      : "text-base md:text-lg font-medium text-deep/80";
  const iconClassName = isLine
    ? "text-deep/35 text-lg font-light group-hover:text-deep/55 transition-colors"
    : isMinimal
      ? "text-deep/35 text-lg font-light group-hover:text-deep/55 transition-colors"
      : "text-deep/35 text-xl font-light group-hover:text-deep/55 transition-colors";
  const contentClassName = isLine
    ? "px-5 pb-5 text-sm text-deep/70 leading-relaxed [&_a]:underline-offset-4 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_p]:mb-3 [&_p:last-child]:mb-0"
    : isMinimal
      ? "px-5 pb-5 text-sm text-deep/70 leading-relaxed [&_a]:underline-offset-4 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_p]:mb-3 [&_p:last-child]:mb-0"
      : "px-5 pb-5 text-sm text-deep/70 leading-relaxed [&_a]:underline-offset-4 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_p]:mb-3 [&_p:last-child]:mb-0";

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={containerClassName}>
      {items.map((item) => {
        const isOpen = openId === item.id;
        const contentId = `${item.id}-content`;
        const triggerId = `${item.id}-trigger`;

        return (
          <div key={item.id} className={itemClassName}>
            <button
              id={triggerId}
              type="button"
              className={buttonClassName}
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => toggleItem(item.id)}
            >
              <div className="space-y-1">
                {item.label ? (
                  <p className="text-[10px] uppercase tracking-[0.26em] text-deep/45">
                    {item.label}
                  </p>
                ) : null}
                <p className={titleClassName}>
                  {item.title}
                </p>
              </div>
              <span
                className={iconClassName}
                aria-hidden="true"
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              id={contentId}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
                isOpen
                  ? "max-h-[1000px] opacity-100"
                  : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className={contentClassName}>
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
