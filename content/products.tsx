import type { ReactNode } from "react";

export type ProductStatus = "available" | "waiting";

export type ProductImage = {
  src: string;
  alt: string;
  objectPosition?: string;
  headline?: string;
  lines?: string[];
  bullets?: string[];
};

export type AccordionSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export type ProductBenefit = {
  title: string;
  text: string;
};

export type ProductBenefitsSection = {
  title: string;
  description?: string;
  items: ProductBenefit[];
};

export type ProductFaqSection = {
  title: string;
  description?: string;
  items: AccordionSection[];
};

export type ProductPrimaryCta = {
  type: "download" | "waitlist";
  label: string;
  helperText?: string;
};

export type ProductKeyFeature = {
  title: string;
  descriptionShort: string;
};

export type ProductSections = {
  keyFeaturesSectionTitle?: string;
  keyFeaturesSectionSubtitle?: string;
  faqTitle?: string;
  faqSubtitle?: string;
  accordionItems?: {
    whoItsFor?: string[] | string;
    whatsInside?: string[] | string;
    releasePlan?: string[] | string;
  };
};

export type ProductBadge = {
  label: string;
  tone?: "soft" | "neutral";
};

export type ProductPairsWithOverride = {
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type ProductConfig = {
  slug: string;
  title: string;
  tags?: string[];
  tagline?: string;
  description: string;
  statusBadgeText?: string;
  primaryCta?: ProductPrimaryCta;
  successMessageLines?: string[];
  endNote?: string;
  keyFeatures?: ProductKeyFeature[];
  sections?: ProductSections;
  shortDescription: string;
  badge: ProductBadge;
  bullets: string[];
  galleryImages?: ProductImage[];
  thumbnail?: string;
  mainPreviewImage: ProductImage;
  downloadTag?: string;
  cta: string;
  ctaLabel?: string;
  ctaNote?: string;
  priceLabel: string;
  status: ProductStatus;
  eta?: string;
  detailsAccordion: AccordionSection[];
  benefits?: ProductBenefitsSection;
  faq?: ProductFaqSection;
  pairsWith?: string[];
  pairsWithTitle?: string;
  pairsWithOverrides?: Record<string, ProductPairsWithOverride>;
  showActions?: boolean;
  showLanguageSelector?: boolean;
  seo?: {
    title: string;
    description: string;
  };
};

export const DEFAULT_PAIRS_WITH_TITLE = "Pairs well with";

const nutritionPreviewImages: ProductImage[] = [
  {
    src: "/images/nutrition-meal-planner/1.jpg",
    alt: "Nutrition Meal Planner preview 1",
  },
  {
    src: "/images/nutrition-meal-planner/2.jpg",
    alt: "Nutrition Meal Planner preview 2",
  },
  {
    src: "/images/nutrition-meal-planner/3.jpg",
    alt: "Nutrition Meal Planner preview 3",
  },
  {
    src: "/images/nutrition-meal-planner/4.jpg",
    alt: "Nutrition Meal Planner preview 4",
  },
  {
    src: "/images/nutrition-meal-planner/5.jpg",
    alt: "Nutrition Meal Planner preview 5",
  },
  {
    src: "/images/nutrition-meal-planner/6.jpg",
    alt: "Nutrition Meal Planner preview 6",
  },
];

export const products: ProductConfig[] = [
  {
    slug: "yearly-goals",
    title: "Yearly Goals",
    tags: ["Planning System", "Quarterly Rhythm", "Minimal Notion", "For Real Life"],
    tagline: "Turn clear goals into steady, focused action.",
    statusBadgeText: "FREE DOWNLOAD",
    primaryCta: {
      type: "download",
      label: "Download",
      helperText: "Works with the free version of Notion.",
    },
    description:
      "A calm, structured Notion system designed to help you plan your year with clarity and intention. Break big goals into focused quarters, connected projects, and meaningful daily action.",
    shortDescription:
      "Minimal Notion system for yearly planning & weekly clarity.",
    badge: {
      label: "Free download",
      tone: "soft",
    },
    bullets: [
      "Goals \u2192 Projects \u2192 Tasks (connected)",
      "Built-in quarterly planning pages",
      "Automatic progress tracking",
      "Clean dashboard + focused views",
      "Duplicate and start in minutes",
    ],
    keyFeatures: [
      {
        title: "Connected Goals",
        descriptionShort:
          "Goals, projects, and tasks stay linked with automatic rollups.",
      },
      {
        title: "Quarterly Focus",
        descriptionShort: "Plan in seasons so priorities stay clear and realistic.",
      },
      {
        title: "Progress Clarity",
        descriptionShort: "Built-in tracking shows momentum without manual updates.",
      },
      {
        title: "Clean Structure",
        descriptionShort: "A minimal layout that keeps your dashboard quiet and usable.",
      },
      {
        title: "Instant Setup",
        descriptionShort: "Duplicate the template and start planning in minutes.",
      },
    ],
    sections: {
      keyFeaturesSectionTitle: "Key Features",
      keyFeaturesSectionSubtitle:
        "A calm structure that turns intention into consistent action.",
      faqTitle: "Frequently Asked Questions",
      faqSubtitle: "Quick answers to keep your download smooth.",
    },
    galleryImages: [
      {
        src: "/images/yearly-goals/2.jpg",
        alt: "Yearly Goals overview detail",
      },
      {
        src: "/images/yearly-goals/3.jpg",
        alt: "Yearly Goals layout detail",
      },
      {
        src: "/images/yearly-goals/4.jpg",
        alt: "Yearly Goals calendar view",
      },
      {
        src: "/images/yearly-goals/5.jpg",
        alt: "Yearly Goals goals table",
      },
      {
        src: "/images/yearly-goals/6.jpg",
        alt: "Yearly Goals projects view",
      },
      {
        src: "/images/yearly-goals/7.jpg",
        alt: "Yearly Goals tasks view",
      },
      {
        src: "/images/yearly-goals/8.jpg",
        alt: "Yearly Goals planning view",
      },
    ],
    thumbnail: "/images/yearly-goals/main-preview.jpg",
    mainPreviewImage: {
      src: "/images/yearly-goals/main-preview.jpg",
      alt: "Yearly Goals preview",
    },
    downloadTag: "yearly-goals",
    cta: "Get now",
    ctaLabel: "Download",
    ctaNote: "Works with the free version of Notion.",
    priceLabel: "Free download",
    status: "available",
    detailsAccordion: [
      {
        id: "what-you-get",
        title: "What You Get",
        content: (
          <div className="space-y-3">
            <p>Inside the template you’ll find:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Yearly Goals dashboard — your main control center</li>
              <li>Quarterly pages (Q1–Q4) with focus planning</li>
              <li>Projects database connected to goals</li>
              <li>Task system with automatic progress calculation</li>
              <li>Monthly to-do view</li>
              <li>Clean relational structure (Goals → Projects → Tasks)</li>
            </ul>
            <p>Everything is connected — nothing duplicated.</p>
          </div>
        ),
      },
      {
        id: "why-it-works",
        title: "Why It Works",
        content: (
          <div className="space-y-3">
            <p>This system works because it combines clarity with structure.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Every goal is connected to projects and tasks</li>
              <li>Progress updates automatically as tasks are completed</li>
              <li>Quarterly focus prevents overwhelm</li>
              <li>Clear “Why” blocks keep motivation visible</li>
              <li>Relational databases remove chaos and duplication</li>
            </ul>
            <p>Instead of scattered to-do lists, you get a single thinking system.</p>
          </div>
        ),
      },
      {
        id: "how-to-use",
        title: "How To Use It",
        content: (
          <div className="space-y-3">
            <p>
              You’ll need a free Notion account (Notion is a free app available on
              desktop and mobile).
            </p>
            <p>After download:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open the template link</li>
              <li>Click “Duplicate” in the top right corner</li>
              <li>Add it to your workspace</li>
              <li>Start customizing your goals</li>
            </ol>
            <p>
              You can modify categories, timelines, and views to match your
              personal workflow.
            </p>
          </div>
        ),
      },
    ],
    benefits: {
      title: "Key Features",
      description: "A calm structure that turns intention into consistent action.",
      items: [
        {
          title: "Connected Goals",
          text: "Goals, projects, and tasks stay linked with automatic rollups.",
        },
        {
          title: "Quarterly Focus",
          text: "Plan in seasons so priorities stay clear and realistic.",
        },
        {
          title: "Progress Clarity",
          text: "Built-in tracking shows momentum without manual updates.",
        },
        {
          title: "Clean Structure",
          text: "A minimal layout that keeps your dashboard quiet and usable.",
        },
        {
          title: "Instant Setup",
          text: "Duplicate the template and start planning in minutes.",
        },
      ],
    },
    faq: {
      title: "Frequently Asked Questions",
      description: "Quick answers to keep your download smooth.",
      items: [
        {
          id: "faq-1",
          title: "Do I need Notion Pro?",
          content: (
            <p>
              No. The template works perfectly with the free version of Notion. You
              only need a free Notion account to use it. After downloading,
              duplicate the template into your own workspace and customize it as
              you like — no paid features required.
            </p>
          ),
        },
        {
          id: "faq-2",
          title: "Can I customize it?",
          content: (
            <p>
              Yes — completely. You can rename pages, adjust categories, add new
              properties, change layouts, or simplify the system to fit your
              workflow. The structure is clean and flexible, so it adapts to your
              goals — not the other way around.
            </p>
          ),
        },
        {
          id: "faq-3",
          title: "Is this a one-time download?",
          content: (
            <p>
              Yes. This is a one-time digital download. After download, you’ll
              receive access to the template link and can duplicate it to your
              workspace and use it indefinitely. If small improvements or fixes
              are released later, you’ll receive updated access.
            </p>
          ),
        },
        {
          id: "faq-4",
          title: "Does it include automations?",
          content: (
            <p>
              Yes — built-in setup buttons and relational links are included. The
              system automatically connects goals, projects, and tasks. Progress
              updates without manual tracking, so your dashboard stays clean and
              accurate. No complex scripting or integrations needed.
            </p>
          ),
        },
        {
          id: "faq-5",
          title: "Can I share it with my team?",
          content: (
            <p>
              Yes, you can share it inside Notion just like any other workspace
              page. If you’re using it for a team, each member will need access to
              the duplicated workspace. For larger teams or commercial use, please
              refer to the license terms on the product page.
            </p>
          ),
        },
      ],
    },
    pairsWith: ["nutrition-meal-planner"],
    pairsWithOverrides: {
      "nutrition-meal-planner": {
        subtitle: "Coming soon",
      },
    },
    showActions: true,
    showLanguageSelector: true,
    seo: {
      title: "Yearly Goals",
      description:
        "A calm, structured Notion system designed to help you plan your year with clarity and intention.",
    },
  },
  {
    slug: "nutrition-meal-planner",
    title: "Nutrition Meal Planner",
    tags: ["Meal Planning", "Nutrient-Aware", "Body-Supportive", "Calm Structure"],
    tagline: "Plan meals, track macros, and stay gently guided.",
    statusBadgeText: "COMING SOON",
    primaryCta: {
      type: "waitlist",
      label: "Join waitlist",
      helperText: "No spam. Just one email when the planner launches.",
    },
    successMessageLines: [
      "You're on the waitlist.",
      "We'll email you when Nutrition Meal Planner launches.",
      "Planned release: April 2026.",
    ],
    endNote: "Early waitlist members may receive launch bonuses.",
    description:
      "A calm system for planning meals, groceries, and nutrient awareness without the chaos.",
    shortDescription: "A structured meal planner + nutrition tracking system.",
    badge: {
      label: "Coming soon",
      tone: "soft",
    },
    bullets: [
      "Weekly meal planning dashboard",
      "Grocery list auto-build from meals",
      "Macros: calories, protein, fats, carbs, fiber",
      "Vitamins & minerals overview",
      "Ingredient nutrient library",
      "Thyroid-friendly view",
      "Cycle-aware guidance",
      "Gentle daily alerts",
    ],
    galleryImages: nutritionPreviewImages,
    thumbnail: "/images/nutrition-meal-planner/main-preview.jpg",
    mainPreviewImage: {
      src: "/images/nutrition-meal-planner/main-preview.jpg",
      alt: "Nutrition Meal Planner main preview",
    },
    cta: "Coming soon",
    priceLabel: "Estimated delivery: April 2026",
    status: "waiting",
    detailsAccordion: [],
    keyFeatures: [
      {
        title: "Weekly Planning Dashboard",
        descriptionShort: "Plan meals once and move through the week with ease.",
      },
      {
        title: "Smart Grocery Automation",
        descriptionShort: "Ingredients auto-build a clean grocery list.",
      },
      {
        title: "Macro Tracking",
        descriptionShort:
          "Track calories, protein, fats, carbs, and fiber in one place.",
      },
      {
        title: "Vitamin & Mineral Tracking",
        descriptionShort:
          "See key vitamins and minerals with gentle, quiet highlights.",
      },
      {
        title: "Ingredient Intelligence Library",
        descriptionShort:
          "Each ingredient shows nutrients, benefits, and deficiency signals.",
      },
      {
        title: "Thyroid-Friendly Support",
        descriptionShort:
          "Focus on iodine, selenium, zinc, and anti-inflammatory patterns.",
      },
      {
        title: "Cycle-Aware Meal Guidance",
        descriptionShort:
          "Guidance aligned to follicular, ovulatory, luteal, and menstrual phases.",
      },
      {
        title: "Gentle Daily Alerts",
        descriptionShort:
          "Soft nudges for low protein, fiber, calories, or missing micros.",
      },
    ],
    sections: {
      keyFeaturesSectionTitle: "Key Features",
      keyFeaturesSectionSubtitle:
        "A calm system that keeps nutrition clear and simple.",
      accordionItems: {
        whoItsFor: [
          "Women who want to understand their bodies better",
          "People managing thyroid health",
          "Those tracking micronutrients beyond calories",
          "Structured thinkers who love systems",
          "Anyone tired of chaotic eating patterns",
        ],
        whatsInside: [
          "Weekly Meal Planner Dashboard",
          "Recipe Database",
          "Ingredient Nutrient Library",
          "Grocery Automation System",
          "Macro & Micronutrient Tracker",
          "Deficiency Awareness Engine",
          "Thyroid Support View",
          "Cycle-Based Planning View",
        ],
        releasePlan: [
          "We’re finishing the first release and will share access in small waves to keep feedback focused and intentional.",
          "Planned Release: April 2026",
        ],
      },
    },
    pairsWith: ["yearly-goals"],
    pairsWithOverrides: {
      "yearly-goals": {
        title: "Yearly Goals System",
        subtitle:
          "Free · A calm, minimalist Notion workspace for yearly planning and aligned routines.",
      },
    },
    showLanguageSelector: true,
    seo: {
      title: "Nutrition Meal Planner",
      description:
        "A calm system for planning meals, groceries, and macros without the chaos.",
    },
  },
];

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);



