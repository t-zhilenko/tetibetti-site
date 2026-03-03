import type { ReactNode } from "react";

export type ProductStatus = "available" | "waiting";

export type ProductImage = {
  src: string;
  alt: string;
  objectPosition?: string;
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
  description: string;
  shortDescription: string;
  badge: ProductBadge;
  bullets: string[];
  galleryImages?: ProductImage[];
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

const nutritionPreviewImages: ProductImage[] = [
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

export const products: ProductConfig[] = [
  {
    slug: "yearly-goals",
    title: "Yearly Goals",
    description:
      "A calm, structured Notion system designed to help you plan your year with clarity and intention. Break big goals into focused quarters, connected projects, and meaningful daily action.",
    shortDescription:
      "Minimal Notion system for yearly planning & weekly clarity.",
    badge: {
      label: "Free download",
      tone: "soft",
    },
    bullets: [
      "Goals \u2192 Projects \u2192 Tasks — fully connected",
      "Built-in quarterly planning system",
      "Automatic progress tracking",
      "Clean, distraction-free structure",
      "Free Notion template — duplicate and use instantly",
    ],
    galleryImages: [
      {
        src: "/images/yearly-goals/2.png",
        alt: "Yearly Goals overview detail",
      },
      {
        src: "/images/yearly-goals/3.png",
        alt: "Yearly Goals layout detail",
      },
      {
        src: "/images/yearly-goals/4.png",
        alt: "Yearly Goals calendar view",
      },
      {
        src: "/images/yearly-goals/5.png",
        alt: "Yearly Goals goals table",
      },
      {
        src: "/images/yearly-goals/6.png",
        alt: "Yearly Goals projects view",
      },
      {
        src: "/images/yearly-goals/7.png",
        alt: "Yearly Goals tasks view",
      },
      {
        src: "/images/yearly-goals/8.png",
        alt: "Yearly Goals planning view",
      },
    ],
    mainPreviewImage: {
      src: "/images/yearly-goals/main-pveview.png",
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
              <li>Clean relational structure (Goals \u2194 Projects \u2194 Tasks)</li>
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
      title: "5 Reasons This System Brings Clarity",
      description: "A calm structure that turns intention into consistent action.",
      items: [
        {
          title: "Quarterly Clarity",
          text: "Work in focused seasons so your goals stop competing for attention.",
        },
        {
          title: "Visible Progress",
          text: "See movement automatically — no manual tracking, no messy dashboards.",
        },
        {
          title: "One Connected System",
          text: "Goals, projects, and tasks stay aligned through relational links.",
        },
        {
          title: "Grounded Execution",
          text: "Monthly views translate vision into realistic daily action.",
        },
        {
          title: "Quiet Automation",
          text: "Built-in buttons handle setup so you can focus on thinking, not formatting.",
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
        imageSrc: "/images/yearly-goals-preview.svg",
        imageAlt: "Nutrition Meal Planner preview",
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
    description:
      "A calm system for planning meals, groceries, and macros without the chaos.",
    shortDescription: "A structured meal planner + nutrition tracking system.",
    badge: {
      label: "Coming soon",
      tone: "soft",
    },
    bullets: [
      "Weekly meal planning dashboard",
      "Grocery list auto-structure",
      "Prep-friendly workflow",
      "Macro & calorie tracking (optional)",
    ],
    galleryImages: nutritionPreviewImages,
    mainPreviewImage: nutritionPreviewImages[0],
    cta: "Coming soon",
    priceLabel: "Estimated delivery: 20 March",
    status: "waiting",
    detailsAccordion: [
      {
        id: "inside",
        title: "What’s inside",
        content: (
          <p>
            A calm, connected system for weekly planning, grocery structure, and
            flexible macro tracking — all in one place.
          </p>
        ),
      },
      {
        id: "for",
        title: "Who it’s for",
        content: (
          <p>
            For anyone who wants a clear meal plan without overwhelm, whether you
            cook daily or batch once a week.
          </p>
        ),
      },
      {
        id: "release",
        title: "Release plan",
        content: (
          <p>
            We’re finishing the first release and will share access in small waves
            to keep feedback focused and intentional.
          </p>
        ),
      },
    ],
    benefits: {
      title: "5 Reasons This Planner Brings Calm to Your Nutrition",
      description: "A structured approach that removes daily decision fatigue.",
      items: [
        {
          title: "Weekly Structure",
          text:
            "Plan meals once and move through the week without constant food decisions.",
        },
        {
          title: "Smart Grocery Flow",
          text:
            "Automatically structured shopping lists reduce waste and last-minute stress.",
        },
        {
          title: "Prep with Intention",
          text: "Batch-friendly workflow makes cooking feel organized, not overwhelming.",
        },
        {
          title: "Optional Macro Awareness",
          text:
            "Track calories and macros only if you need them — no pressure, no noise.",
        },
        {
          title: "One Connected Space",
          text:
            "Meals, groceries, prep and tracking stay aligned in a single calm system.",
        },
      ],
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
  {
    slug: "java-cheat-sheets",
    title: "Java Cheat Sheets",
    description:
      "Practical Java notes and interview-ready references for faster study sessions.",
    shortDescription: "Practical Java notes + interview-ready cheat sheets.",
    badge: {
      label: "Coming soon",
      tone: "soft",
    },
    bullets: [
      "Topic-by-topic syntax refreshers",
      "Interview-ready reference tables",
      "Focused patterns and gotchas",
      "Printable, distraction-free layout",
    ],
    galleryImages: [],
    mainPreviewImage: {
      src: "",
      alt: "Java Cheat Sheets preview",
    },
    cta: "Coming soon",
    priceLabel: "Estimated delivery: 15 April",
    status: "waiting",
    detailsAccordion: [
      {
        id: "inside",
        title: "What’s inside",
        content: (
          <p>
            A focused set of Java references covering core syntax, collections, and
            common interview topics.
          </p>
        ),
      },
      {
        id: "for",
        title: "Who it’s for",
        content: (
          <p>
            For students, career switchers, and developers who want quick, reliable
            Java refreshers.
          </p>
        ),
      },
      {
        id: "release",
        title: "Release plan",
        content: (
          <p>
            The first edition is in progress. Early access and updates will be
            shared as it launches.
          </p>
        ),
      },
    ],
    showLanguageSelector: false,
    seo: {
      title: "Java Cheat Sheets",
      description:
        "Practical Java notes and interview-ready references for faster study sessions.",
    },
  },
];

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);

