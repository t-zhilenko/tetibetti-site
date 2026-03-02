"use client";

import { useState } from "react";
import ProductPageLayout from "@/components/product/ProductPageLayout";
import LanguageSelector from "@/components/LanguageSelector";
import SubscribeForm from "@/components/SubscribeForm";
import ProductGalleryEmbla from "@/components/ProductGalleryEmbla";
import PairsWithSection from "@/components/product/PairsWithSection";

const createPreviewSvg = (label: string, from: string, to: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="900" height="900" fill="url(#g)"/>
    <rect x="90" y="110" width="720" height="460" rx="40" fill="rgba(255,255,255,0.6)"/>
    <rect x="90" y="600" width="420" height="24" rx="12" fill="rgba(43,89,104,0.16)"/>
    <rect x="90" y="640" width="320" height="24" rx="12" fill="rgba(43,89,104,0.12)"/>
    <text x="90" y="720" fill="rgba(43,89,104,0.55)" font-size="30" font-family="Georgia, serif">${label}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const previewImages = [
  {
    src: createPreviewSvg("Preview 1", "#f7dce0", "#eaf3f6"),
    alt: "Preview 1",
  },
  {
    src: createPreviewSvg("Preview 2", "#f2efe9", "#f3f7f2"),
    alt: "Preview 2",
  },
  {
    src: createPreviewSvg("Preview 3", "#f5dfe6", "#fdf9f9"),
    alt: "Preview 3",
  },
  {
    src: createPreviewSvg("Preview 4", "#eaf3f6", "#fdf9f9"),
    alt: "Preview 4",
  },
];

export default function Page() {
  const [language, setLanguage] = useState<"en" | "uk">("en");

  return (
    <ProductPageLayout
      title="Nutrition Meal Planner"
      description="A calm system for planning meals, groceries, and macros without the chaos."
      badgeLabel="Coming soon"
      bullets={[
        "Weekly meal planning dashboard",
        "Grocery list auto-structure",
        "Prep-friendly workflow",
        "Macro & calorie tracking (optional)",
      ]}
      languageSelector={
        <LanguageSelector
          label="Language"
          value={language}
          onChange={setLanguage}
          options={[
            { value: "en", label: "English" },
            { value: "uk", label: "Ukrainian" },
          ]}
        />
      }
      cta={
        <div className="px-2 py-2">
          <p className="text-sm text-deep/70">
            Join the waitlist to get early access and launch updates.
          </p>
          <div className="mt-4">
            <SubscribeForm
              tag="nutrition-meal-planner"
              buttonLabel="Join waitlist"
              layout="aligned"
            />
          </div>
        </div>
      }
      relatedContent={
        <PairsWithSection
          title="Pairs with"
          items={[
            {
              title: "Yearly Goals System",
              subtitle:
                "Free · A calm, minimalist Notion workspace for yearly planning and aligned routines.",
              href: "/product/yearly-goals",
              imageSrc: "/images/yearly-goals/main-pveview.png",
              imageAlt: "Yearly Goals System preview",
            },
          ]}
        />
      }
      media={<ProductGalleryEmbla images={previewImages} />}
      benefits={{
        title: "5 Reasons This Planner Brings Calm to Your Nutrition",
        description: "A structured approach that removes daily decision fatigue.",
        items: [
          {
            title: "Weekly Structure",
            text: "Plan meals once and move through the week without constant food decisions.",
          },
          {
            title: "Smart Grocery Flow",
            text: "Automatically structured shopping lists reduce waste and last-minute stress.",
          },
          {
            title: "Prep with Intention",
            text: "Batch-friendly workflow makes cooking feel organized, not overwhelming.",
          },
          {
            title: "Optional Macro Awareness",
            text: "Track calories and macros only if you need them -- no pressure, no noise.",
          },
          {
            title: "One Connected Space",
            text: "Meals, groceries, prep and tracking stay aligned in a single calm system.",
          },
        ],
      }}
      detailsAccordion={[
        {
          id: "inside",
          title: "What's inside",
          content: (
            <p>
              A calm, connected system for weekly planning, grocery structure, and
              flexible macro tracking -- all in one place.
            </p>
          ),
        },
        {
          id: "for",
          title: "Who it's for",
          content: (
            <p>
              For anyone who wants a clear meal plan without overwhelm, whether
              you cook daily or batch once a week.
            </p>
          ),
        },
        {
          id: "release",
          title: "Release plan",
          content: (
            <p>
              We're finishing the first release and will invite the waitlist in
              small waves to keep feedback focused and intentional.
            </p>
          ),
        },
      ]}
    />
  );
}
