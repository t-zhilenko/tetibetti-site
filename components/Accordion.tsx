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
};

export default function Accordion({ items }: AccordionProps) {
  const initialOpenId = useMemo(() => {
    const found = items.find((item) => item.defaultOpen);
    return found ? found.id : null;
  }, [items]);

  const [openId, setOpenId] = useState<string | null>(initialOpenId);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const contentId = `${item.id}-content`;
        const triggerId = `${item.id}-trigger`;

        return (
          <div
            key={item.id}
            className="rounded-2xl border border-[#cabab1]/30 bg-[#fdf9f9]"
          >
            <button
              id={triggerId}
              type="button"
              className="group w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:text-deep/85 focus-visible:text-deep/85"
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
                <p className="text-base md:text-lg font-medium text-deep/80">
                  {item.title}
                </p>
              </div>
              <span
                className={`text-deep/45 transition-all duration-200 ${
                  isOpen ? "rotate-180" : "rotate-0"
                } group-hover:text-deep/65`}
                aria-hidden="true"
              >
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 8l5 5 5-5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
              <div className="px-5 pb-5 text-sm text-deep/70 leading-relaxed [&_a]:underline-offset-4 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_p]:mb-3 [&_p:last-child]:mb-0">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
