import type { Locale } from "@/i18n/routing";

export type ProductStatus = "available" | "waiting";

export type ProductImage = {
  src: string;
  alt: string;
  objectPosition?: string;
  headline?: string;
  lines?: string[];
  bullets?: string[];
};

export type ProductContentBlock = {
  intro?: string;
  paragraphs?: string[];
  bullets?: string[];
  ordered?: string[];
  outro?: string;
};

export type ProductAccordionSection = {
  id: string;
  title: string;
  content: ProductContentBlock;
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

export type ProductFaqItem = {
  id: string;
  title: string;
  answer: string;
};

export type ProductFaqSection = {
  title: string;
  description?: string;
  items: ProductFaqItem[];
};

export type ProductPrimaryCta = {
  type: "download" | "waitlist";
  label: string;
  helperText?: string;
  endpoint?: string;
};

export type ProductCheckoutType = "free" | "waitlist" | "paid";
export type ProductCheckoutMode = "modal" | "redirect";

export type ProductPurchaseConfig = {
  type: ProductCheckoutType;
  price?: number;
  currency?: string;
  checkoutMode?: ProductCheckoutMode;
  checkoutEnabled?: boolean;
  note?: string;
  helperText?: string;
  trustText?: string;
  ctaLabel?: string;
  emailSubmitLabel?: string;
  emailHelperText?: string;
  interestEndpoint?: string;
  promoEnabled?: boolean;
  modalTitle?: string;
  modalLines?: string[];
  modalSuccessLines?: string[];
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
  detailsAccordion: ProductAccordionSection[];
  benefits?: ProductBenefitsSection;
  faq?: ProductFaqSection;
  pairsWith?: string[];
  pairsWithTitle?: string;
  pairsWithOverrides?: Record<string, ProductPairsWithOverride>;
  showActions?: boolean;
  showLanguageSelector?: boolean;
  purchase?: ProductPurchaseConfig;
  seo?: {
    title: string;
    description: string;
  };
};

type ProductSlug =
  | "yearly-goals"
  | "nutrition-meal-planner"
  | "body-and-nutrition-tracker";

type ProductStaticConfig = Pick<
  ProductConfig,
  | "slug"
  | "status"
  | "galleryImages"
  | "thumbnail"
  | "mainPreviewImage"
  | "downloadTag"
  | "pairsWith"
  | "showActions"
  | "showLanguageSelector"
>;

type ProductLocalizedConfig = Omit<ProductConfig, keyof ProductStaticConfig>;

const fallbackLocale: Locale = "en";
const productOrder: ProductSlug[] = [
  "yearly-goals",
  "nutrition-meal-planner",
  "body-and-nutrition-tracker",
];

const nutritionPreviewImages: ProductImage[] = [
  { src: "/images/nutrition-meal-planner/1.jpg", alt: "Nutrition Meal Planner preview 1" },
  { src: "/images/nutrition-meal-planner/2.jpg", alt: "Nutrition Meal Planner preview 2" },
  { src: "/images/nutrition-meal-planner/3.jpg", alt: "Nutrition Meal Planner preview 3" },
  { src: "/images/nutrition-meal-planner/4.jpg", alt: "Nutrition Meal Planner preview 4" },
  { src: "/images/nutrition-meal-planner/5.jpg", alt: "Nutrition Meal Planner preview 5" },
  { src: "/images/nutrition-meal-planner/6.jpg", alt: "Nutrition Meal Planner preview 6" },
];

const bodyNutritionPreviewImages: ProductImage[] = [
  { src: "/images/body-and-nutrition-tracker/1.jpg", alt: "Body & Nutrition Tracker dashboard overview" },
  { src: "/images/body-and-nutrition-tracker/2.jpg", alt: "Body & Nutrition Tracker personal dashboard" },
  { src: "/images/body-and-nutrition-tracker/3.jpg", alt: "Body & Nutrition Tracker nutrition targets" },
  { src: "/images/body-and-nutrition-tracker/4.jpg", alt: "Body & Nutrition Tracker required inputs" },
  { src: "/images/body-and-nutrition-tracker/5.jpg", alt: "Body & Nutrition Tracker check-in workflow" },
  { src: "/images/body-and-nutrition-tracker/6.jpg", alt: "Body & Nutrition Tracker weekly summary" },
  { src: "/images/body-and-nutrition-tracker/7.jpg", alt: "Body & Nutrition Tracker profile setup" },
];

const productStaticConfigs: Record<ProductSlug, ProductStaticConfig> = {
  "yearly-goals": {
    slug: "yearly-goals",
    status: "available",
    galleryImages: [
      { src: "/images/yearly-goals/2.jpg", alt: "Yearly Goals overview detail" },
      { src: "/images/yearly-goals/3.jpg", alt: "Yearly Goals layout detail" },
      { src: "/images/yearly-goals/4.jpg", alt: "Yearly Goals calendar view" },
      { src: "/images/yearly-goals/5.jpg", alt: "Yearly Goals goals table" },
      { src: "/images/yearly-goals/6.jpg", alt: "Yearly Goals projects view" },
      { src: "/images/yearly-goals/7.jpg", alt: "Yearly Goals tasks view" },
      { src: "/images/yearly-goals/8.jpg", alt: "Yearly Goals planning view" },
    ],
    thumbnail: "/images/yearly-goals/main-preview.jpg",
    mainPreviewImage: {
      src: "/images/yearly-goals/main-preview.jpg",
      alt: "Yearly Goals preview",
    },
    downloadTag: "yearly-goals",
    pairsWith: ["nutrition-meal-planner"],
    showActions: true,
    showLanguageSelector: true,
  },
  "nutrition-meal-planner": {
    slug: "nutrition-meal-planner",
    status: "waiting",
    galleryImages: nutritionPreviewImages,
    thumbnail: "/images/nutrition-meal-planner/main-preview.jpg",
    mainPreviewImage: {
      src: "/images/nutrition-meal-planner/main-preview.jpg",
      alt: "Nutrition Meal Planner main preview",
    },
    pairsWith: ["yearly-goals"],
    showLanguageSelector: true,
  },
  "body-and-nutrition-tracker": {
    slug: "body-and-nutrition-tracker",
    status: "available",
    galleryImages: bodyNutritionPreviewImages,
    thumbnail: "/images/body-and-nutrition-tracker/1.jpg",
    mainPreviewImage: {
      src: "/images/body-and-nutrition-tracker/1.jpg",
      alt: "Body & Nutrition Tracker main preview",
    },
    pairsWith: ["nutrition-meal-planner"],
    showLanguageSelector: true,
  },
};

const localizedProductConfigs: Record<Locale, Record<ProductSlug, ProductLocalizedConfig>> = {
  en: {
    "yearly-goals": {
      title: "Yearly Goals",
      tags: ["Planning System", "Quarterly Rhythm", "Minimal Notion", "For Real Life"],
      tagline: "Turn clear goals into calm, consistent progress.",
      statusBadgeText: "FREE DOWNLOAD",
      primaryCta: {
        type: "download",
        label: "Download",
        helperText: "Works with the free version of Notion.",
        endpoint: "/api/brevo/yearly-goals-download",
      },
      description:
        "A calm, structured Notion system for planning your year with clarity and intention. Break bigger goals into focused quarters, connected projects, and meaningful daily steps.",
      shortDescription: "A minimal Notion system for yearly planning and weekly clarity.",
      badge: { label: "Free download", tone: "soft" },
      bullets: [
        "Goals -> Projects -> Tasks (connected)",
        "Built-in quarterly planning pages",
        "Automatic progress tracking",
        "A clean dashboard with focused views",
        "Duplicate the template and begin in minutes",
      ],
      keyFeatures: [
        {
          title: "Connected Goals",
          descriptionShort: "Goals, projects, and tasks stay linked with automatic rollups.",
        },
        {
          title: "Quarterly Focus",
          descriptionShort: "Plan in seasons so priorities stay clear and realistic.",
        },
        {
          title: "Progress Clarity",
          descriptionShort: "Built-in tracking shows your progress without manual updates.",
        },
        {
          title: "Clean Structure",
          descriptionShort: "A minimal layout that keeps your space calm and usable.",
        },
        {
          title: "Instant Setup",
          descriptionShort: "Duplicate the template and begin in minutes.",
        },
      ],
      sections: {
        keyFeaturesSectionTitle: "Key Features",
        keyFeaturesSectionSubtitle: "A calm structure that turns intention into consistent progress.",
        faqTitle: "Frequently Asked Questions",
        faqSubtitle: "Quick answers to keep your download simple.",
      },
      cta: "Download",
      ctaLabel: "Download",
      ctaNote: "Works with the free version of Notion.",
      priceLabel: "Free download",
      detailsAccordion: [
        {
          id: "what-you-get",
          title: "What You Get",
          content: {
            intro: "Inside the template you'll find:",
            bullets: [
              "Yearly Goals dashboard - your main planning space",
              "Quarterly pages (Q1-Q4) for focus planning",
              "Projects database connected to goals",
              "Task system with automatic progress calculation",
              "Monthly task list",
              "Clean relational structure (Goals -> Projects -> Tasks)",
            ],
            outro: "Everything is connected - nothing is duplicated.",
          },
        },
        {
          id: "why-it-works",
          title: "Why It Works",
          content: {
            intro: "This system works by combining clarity with structure.",
            bullets: [
              "Every goal is connected to projects and tasks",
              "Progress updates automatically as tasks are completed",
              "Quarterly focus prevents overwhelm",
              "Clear Why blocks keep motivation visible",
              "Relational databases reduce chaos and duplication",
            ],
            outro: "Instead of scattered to-do lists, you get one thinking space.",
          },
        },
        {
          id: "how-to-use",
          title: "How To Use It",
          content: {
            paragraphs: [
              "You'll need a free Notion account (available on desktop and mobile).",
              "After download:",
            ],
            ordered: [
              "Open the template link",
              "Click Duplicate in the top right corner",
              "Add it to your workspace",
              "Start customizing your goals",
            ],
            outro: "You can adjust categories, timelines, and views to match your workflow.",
          },
        },
      ],
      benefits: {
        title: "Key Features",
        description: "A calm structure that turns intention into consistent progress.",
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
            text: "Built-in tracking shows your progress without manual updates.",
          },
          {
            title: "Clean Structure",
            text: "A minimal layout that keeps your space calm and usable.",
          },
          {
            title: "Instant Setup",
            text: "Duplicate the template and begin in minutes.",
          },
        ],
      },
      faq: {
        title: "Frequently Asked Questions",
        description: "Quick answers to keep your download simple.",
        items: [
          {
            id: "faq-1",
            title: "Do I need Notion Pro?",
            answer:
              "No. The template works with the free version of Notion. You only need a free account to duplicate and use it.",
          },
          {
            id: "faq-2",
            title: "Can I customize it?",
            answer:
              "Yes. You can rename pages, adjust categories, add properties, and simplify the system to fit your workflow.",
          },
          {
            id: "faq-3",
            title: "Is this a one-time download?",
            answer:
              "Yes. After download, you receive template access and can use it indefinitely in your workspace.",
          },
          {
            id: "faq-4",
            title: "Does it include automations?",
            answer:
              "Yes. Built-in relations keep goals, projects, and tasks connected, with automatic progress updates.",
          },
          {
            id: "faq-5",
            title: "Can I share it with my team?",
            answer:
              "You can share a duplicated workspace in Notion with your team. For commercial usage, please refer to the license terms.",
          },
        ],
      },
      pairsWithTitle: "Pairs well with",
      pairsWithOverrides: {
        "nutrition-meal-planner": {
          subtitle: "Coming soon",
        },
      },
      seo: {
        title: "Yearly Goals",
        description:
          "A calm, structured Notion system for planning your year with clarity and intention.",
      },
    },
    "nutrition-meal-planner": {
      title: "Nutrition Meal Planner",
      tags: ["Meal Planning", "Nutrient-Aware", "Body-Supportive", "Calm Structure"],
      tagline: "Plan meals, track nutrition, and stay gently guided.",
      statusBadgeText: "COMING SOON",
      primaryCta: {
        type: "waitlist",
        label: "Join waitlist",
        helperText: "No spam. Just one email when it's ready.",
        endpoint: "/api/brevo/nutrition-waitlist",
      },
      successMessageLines: [
        "You're on the waitlist.",
        "We'll email you when Nutrition Meal Planner is ready.",
        "Coming summer 2026.",
      ],
      endNote: "Early waitlist members may receive something extra at launch.",
      description: "A calm system for planning meals, groceries, and nutrition without the noise.",
      shortDescription: "A structured meal planner with gentle nutrition tracking.",
      badge: { label: "Coming soon", tone: "soft" },
      bullets: [
        "Weekly meal planning space",
        "Grocery list auto-built from meals",
        "Macros: calories, protein, fats, carbs, fiber",
        "Vitamins & minerals overview",
        "Ingredient nutrition library",
        "Thyroid-friendly view",
        "Cycle-aware guidance",
        "Gentle daily nudges",
      ],
      cta: "Coming soon",
      priceLabel: "Coming summer 2026",
      detailsAccordion: [],
      keyFeatures: [
        {
          title: "Weekly Planning Space",
          descriptionShort: "Plan meals once and move through the week with ease.",
        },
        {
          title: "Smart Grocery Automation",
          descriptionShort: "Ingredients auto-build a simple grocery list.",
        },
        {
          title: "Nutrition Tracking",
          descriptionShort: "Track calories, protein, fats, carbs, and fiber in one place.",
        },
        {
          title: "Vitamin & Mineral Tracking",
          descriptionShort: "See key vitamins and minerals with gentle, quiet highlights.",
        },
        {
          title: "Ingredient Intelligence Library",
          descriptionShort: "Each ingredient shows nutrients, benefits, and early signals of imbalance.",
        },
        {
          title: "Thyroid-Friendly Support",
          descriptionShort: "Focus on iodine, selenium, zinc, and anti-inflammatory choices.",
        },
        {
          title: "Cycle-Aware Meal Guidance",
          descriptionShort:
            "Guidance aligned to follicular, ovulatory, luteal, and menstrual phases.",
        },
        {
          title: "Gentle Daily Nudges",
          descriptionShort: "Soft nudges for low protein, fiber, calories, or missing micros.",
        },
      ],
      sections: {
        keyFeaturesSectionTitle: "Key Features",
        keyFeaturesSectionSubtitle: "A calm system that keeps nutrition clear and simple.",
        accordionItems: {
          whoItsFor: [
            "Women who want to understand their bodies better",
            "People supporting thyroid health",
            "Those tracking micronutrients beyond calories",
            "Structured thinkers who value systems",
            "Anyone tired of chaotic eating patterns",
          ],
          whatsInside: [
            "Weekly Meal Planning Space",
            "Recipe Database",
            "Ingredient Nutrition Library",
            "Grocery Automation System",
            "Macro & Micronutrient Tracker",
            "Imbalance Signals View",
            "Thyroid Support View",
            "Cycle-Based Planning View",
          ],
          releasePlan: [
            "We're finishing the first release and will share access in small waves to keep feedback focused and thoughtful.",
            "Coming summer 2026.",
          ],
        },
      },
      pairsWithTitle: "Pairs well with",
      pairsWithOverrides: {
        "yearly-goals": {
          title: "Yearly Goals System",
          subtitle:
            "Free · A calm, minimalist Notion space for yearly planning and aligned routines.",
        },
      },
      seo: {
        title: "Nutrition Meal Planner",
        description: "A calm system for planning meals, groceries, and nutrition without the noise.",
      },
    },
    "body-and-nutrition-tracker": {
      title: "Body & Nutrition Tracker",
      tags: ["NUTRITION TRACKING", "MINIMAL SYSTEM", "BODY AWARENESS", "CALM STRUCTURE"],
      tagline:
        "A simple Notion tracker for body check-ins and automatic nutrition targets. Track your progress with minimal effort, clear dashboards, and a calm, supportive structure.",
      description:
        "A simple Notion body and nutrition tracker with weekly check-ins, automatic calorie and macro targets, and a calm dashboard designed for everyday use.",
      shortDescription:
        "A simple Notion tracker for body check-ins and automatic nutrition targets.",
      statusBadgeText: "FREE DOWNLOAD",
      primaryCta: {
        type: "download",
        label: "Download",
        helperText: "Works with the free version of Notion.",
        endpoint: "/api/brevo/body-nutrition-download",
      },
      badge: { label: "Free download", tone: "soft" },
      bullets: [
        "Weekly check-ins with weight, measurements, and optional body signals",
        "Automatic calorie and macro calculation",
        "Only weight + activity level required",
        "Personal dashboard created automatically",
        "Progress tracking over time",
        "Designed to live on your main page",
        "Multiple profiles supported",
        "Only 2 inputs. No overwhelm.",
      ],
      cta: "Download",
      ctaLabel: "Download",
      ctaNote: "Works with the free version of Notion.",
      priceLabel: "Free download",
      detailsAccordion: [
        {
          id: "who-its-for",
          title: "Who It's For",
          content: {
            bullets: [
              "people who want a simple nutrition tracking system",
              "people who feel overwhelmed by complex trackers",
              "users who want to track body changes without pressure",
              "anyone who wants clear calorie and macro targets with minimal setup",
            ],
          },
        },
        {
          id: "whats-inside",
          title: "What's Inside",
          content: {
            bullets: [
              "profile creation flow",
              "automatic personal dashboard",
              "weekly check-in system",
              "body measurements logging",
              "optional digestion and energy tracking",
              "automatic nutrition targets",
              "multi-profile support",
              "intention / reflection section",
            ],
          },
        },
        {
          id: "how-it-works",
          title: "How It Works",
          content: {
            ordered: [
              "create your profile",
              "fill in name, age, height, and gender",
              "add your first check-in",
              "weight and activity level are the only required fields",
              "click \"Update Targets\"",
              "calories and macros are calculated automatically",
              "check in weekly to track progress",
              "recalculate targets after every ~5 kg change",
            ],
          },
        },
        {
          id: "release-plan",
          title: "Release Plan",
          content: {
            paragraphs: [
              "This tracker is part of a larger nutrition system currently in development.",
              "It will later connect naturally with meal planning, ingredient intelligence, and deeper nutrition insights.",
            ],
          },
        },
      ],
      keyFeatures: [
        {
          title: "Minimal Input",
          descriptionShort: "Only weight and activity level are required to get started.",
        },
        {
          title: "Automatic Targets",
          descriptionShort: "Calories and macros are calculated for you.",
        },
        {
          title: "Weekly Check-Ins",
          descriptionShort: "Track your body changes over time with simple updates.",
        },
        {
          title: "Personal Dashboard",
          descriptionShort: "Your key numbers, reminders, and actions in one place.",
        },
        {
          title: "Main Page Friendly",
          descriptionShort: "A clean dashboard you can place on your main Notion page.",
        },
        {
          title: "Progress Visibility",
          descriptionShort: "See changes in weight and measurements clearly.",
        },
        {
          title: "Optional Body Signals",
          descriptionShort: "Track digestion, energy, and other patterns if helpful.",
        },
        {
          title: "Multiple Profiles",
          descriptionShort: "Use the same system for more than one person.",
        },
      ],
      sections: {
        keyFeaturesSectionTitle: "Key Features",
        keyFeaturesSectionSubtitle: "A calm system for tracking progress clearly and simply.",
      },
      pairsWithTitle: "Pairs well with",
      pairsWithOverrides: {
        "nutrition-meal-planner": {
          title: "Nutrition Meal Planner",
          subtitle: "Plan meals, track nutrients, and stay gently guided.",
        },
      },
      seo: {
        title: "Body & Nutrition Tracker",
        description:
          "A simple Notion body and nutrition tracker with weekly check-ins, automatic calorie and macro targets, and a calm dashboard designed for everyday use.",
      },
    },
  },
  uk: {
    "yearly-goals": {
      title: "Yearly Goals",
      tags: ["Система планування", "Квартальний ритм", "Мінімалістичний Notion", "Для реального життя"],
      tagline: "Перетворюйте чіткі цілі на спокійний і послідовний рух.",
      statusBadgeText: "БЕЗКОШТОВНО",
      primaryCta: {
        type: "download",
        label: "Завантажити",
        helperText: "Працює у безкоштовній версії Notion.",
      },
      description:
        "Спокійна, структурована система в Notion, яка допомагає планувати рік з ясністю та наміром. Великі цілі розбиваються на квартали, проєкти й щоденні дії.",
      shortDescription: "Мінімалістична система Notion для річного планування.",
      badge: { label: "Безкоштовно", tone: "soft" },
      bullets: [
        "Цілі → Проєкти → Задачі (усе пов’язано)",
        "Вбудовані сторінки квартального планування",
        "Автоматичне відстеження прогресу",
        "Чистий дашборд і фокусні перегляди",
        "Скопіюйте шаблон і почніть за кілька хвилин",
      ],
      keyFeatures: [
        {
          title: "Пов’язані цілі",
          descriptionShort: "Цілі, проєкти й задачі поєднані автоматичними зв’язками.",
        },
        {
          title: "Квартальний фокус",
          descriptionShort: "Плануйте сезонами, щоб пріоритети залишалися чіткими.",
        },
        {
          title: "Прозорий прогрес",
          descriptionShort: "Система показує рух уперед без ручних оновлень.",
        },
        {
          title: "Чиста структура",
          descriptionShort: "Мінімалістичний інтерфейс без зайвого шуму.",
        },
        {
          title: "Швидкий старт",
          descriptionShort: "Скопіюйте шаблон і почніть за кілька хвилин.",
        },
      ],
      sections: {
        keyFeaturesSectionTitle: "Ключові можливості",
        keyFeaturesSectionSubtitle: "Спокійна, структурована система, що перетворює намір на стабільну дію.",
        faqTitle: "Поширені запитання",
        faqSubtitle: "Короткі відповіді, щоб усе працювало гладко.",
      },
      cta: "Завантажити",
      ctaLabel: "Завантажити",
      ctaNote: "Працює у безкоштовній версії Notion.",
      priceLabel: "Безкоштовно",
      detailsAccordion: [
        {
          id: "what-you-get",
          title: "Що всередині",
          content: {
            intro: "У шаблоні ви знайдете:",
            bullets: [
              "Дашборд Yearly Goals — ваш головний центр керування",
              "Квартальні сторінки (Q1–Q4) для фокусу",
              "База проєктів, пов’язана з цілями",
              "Система задач з автоматичним розрахунком прогресу",
              "Щомісячний список задач",
              "Чиста реляційна структура (Цілі → Проєкти → Задачі)",
            ],
            outro: "Усе пов’язано — без копіювання.",
          },
        },
        {
          id: "why-it-works",
          title: "Чому це працює",
          content: {
            intro: "Система поєднує ясність і структуру.",
            bullets: [
              "Кожна ціль пов’язана з проєктами й задачами",
              "Прогрес оновлюється автоматично",
              "Квартальний фокус зменшує перевантаження",
              "Блоки «Чому» підтримують мотивацію",
              "Реляційні бази прибирають хаос і копіювання",
            ],
            outro: "Замість розрізнених списків ви отримуєте єдину мисленнєву систему.",
          },
        },
        {
          id: "how-to-use",
          title: "Як користуватись",
          content: {
            paragraphs: [
              "Потрібен лише безкоштовний акаунт Notion (доступний на комп’ютері й телефоні).",
              "Після завантаження:",
            ],
            ordered: [
              "Відкрийте посилання на шаблон",
              "Натисніть «Duplicate» у правому верхньому куті",
              "Додайте шаблон у свій робочий простір",
              "Налаштуйте цілі під себе",
            ],
            outro: "Можна змінювати категорії, таймлайни та перегляди під власний ритм.",
          },
        },
      ],
      benefits: {
        title: "Ключові можливості",
        description: "Спокійна, структурована система, що перетворює намір на стабільну дію.",
        items: [
          {
            title: "Пов’язані цілі",
            text: "Цілі, проєкти й задачі залишаються в єдиній системі.",
          },
          {
            title: "Квартальний фокус",
            text: "Плануйте сезонами, щоб утримувати реалістичні пріоритети.",
          },
          {
            title: "Прозорий прогрес",
            text: "Вбудоване відстеження показує динаміку без ручної рутини.",
          },
          {
            title: "Чиста структура",
            text: "Мінімалістичний інтерфейс, який допомагає зосередитись.",
          },
          {
            title: "Швидкий старт",
            text: "Скопіюйте шаблон і одразу починайте планування.",
          },
        ],
      },
      faq: {
        title: "Поширені запитання",
        description: "Короткі відповіді для зручного старту.",
        items: [
          {
            id: "faq-1",
            title: "Чи потрібен Notion Pro?",
            answer: "Ні. Шаблон повністю працює у безкоштовній версії Notion.",
          },
          {
            id: "faq-2",
            title: "Чи можна змінювати шаблон?",
            answer: "Так, повністю. Можна адаптувати структуру під свій процес.",
          },
          {
            id: "faq-3",
            title: "Це одноразове завантаження?",
            answer: "Так. Після завантаження ви отримуєте доступ без обмежень.",
          },
          {
            id: "faq-4",
            title: "Чи є автоматизації?",
            answer: "Так. Зв’язки між цілями, проєктами та задачами працюють автоматично.",
          },
          {
            id: "faq-5",
            title: "Чи можна ділитися з командою?",
            answer: "Так. Для комерційного використання дивіться умови ліцензії.",
          },
        ],
      },
      pairsWithTitle: "Добре поєднується з",
      pairsWithOverrides: {
        "nutrition-meal-planner": {
          subtitle: "Незабаром",
        },
      },
      seo: {
        title: "Yearly Goals — Notion шаблон для планування року",
        description:
          "Yearly Goals — мінімалістичний Notion шаблон для планування року: цілі, проєкти й задачі в одній спокійній системі.",
      },
    },
    "nutrition-meal-planner": {
      title: "Nutrition Meal Planner",
      tags: ["Планування харчування", "Баланс нутрієнтів", "Підтримка тіла", "Спокійна структура"],
      tagline: "Плануйте меню, відстежуйте макронутрієнти та рухайтеся м’яко.",
      statusBadgeText: "СКОРО",
      primaryCta: {
        type: "waitlist",
        label: "До списку очікування",
        helperText: "Без спаму. Лише один лист, коли продукт буде готовий.",
        endpoint: "/api/brevo/nutrition-waitlist",
      },
      successMessageLines: [
        "Ви у списку очікування.",
        "Ми напишемо вам, коли Nutrition Meal Planner буде готовий.",
        "Очікується влітку 2026.",
      ],
      endNote: "Ранні учасники списку очікування можуть отримати бонуси запуску.",
      description:
        "Спокійна система для планування меню, списку покупок і нутрієнтів без хаосу.",
      shortDescription: "Структурований планер харчування з трекінгом нутрієнтів.",
      badge: { label: "Скоро", tone: "soft" },
      bullets: [
        "Тижневий дашборд планування меню",
        "Список покупок формується автоматично",
        "Макронутрієнти: калорії, білки, жири, вуглеводи, клітковина",
        "Огляд вітамінів і мінералів",
        "База інгредієнтів із нутрієнтами",
        "Підтримка здоров’я щитоподібної залози",
        "Підказки з урахуванням циклу",
        "Делікатні щоденні нагадування",
      ],
      cta: "Скоро",
      priceLabel: "Очікується влітку 2026",
      detailsAccordion: [],
      keyFeatures: [
        {
          title: "Тижневий дашборд планування",
          descriptionShort: "Плануйте меню один раз — і тиждень стає спокійнішим.",
        },
        {
          title: "Розумна автоматизація покупок",
          descriptionShort: "Інгредієнти автоматично формують зрозумілий список покупок.",
        },
        {
          title: "Трекінг макронутрієнтів",
          descriptionShort: "В одному місці: калорії, білки, жири, вуглеводи та клітковина.",
        },
        {
          title: "Вітаміни та мінерали",
          descriptionShort: "Ключові мікронутрієнти з делікатними підказками.",
        },
        {
          title: "База інгредієнтів",
          descriptionShort: "Кожен інгредієнт містить поживність і сигнали можливих дефіцитів.",
        },
        {
          title: "Підтримка щитоподібної залози",
          descriptionShort: "Фокус на йоді, селені, цинку та протизапальному підході.",
        },
        {
          title: "Планування з урахуванням циклу",
          descriptionShort:
            "Підказки для фолікулярної, овуляторної, лютеїнової та менструальної фаз.",
        },
        {
          title: "Делікатні щоденні нагадування",
          descriptionShort:
            "Делікатні нагадування про білок, клітковину, калорії та мікронутрієнти.",
        },
      ],
      sections: {
        keyFeaturesSectionTitle: "Ключові можливості",
        keyFeaturesSectionSubtitle: "Спокійна система, що робить харчування простішим.",
        accordionItems: {
          whoItsFor: [
            "Для жінок, які хочуть краще розуміти своє тіло",
            "Для тих, хто дбає про здоров’я щитоподібної залози",
            "Для тих, хто відстежує мікронутрієнти, а не лише калорії",
            "Для людей, які люблять структуру",
            "Для всіх, хто втомився від хаосу в харчуванні",
          ],
          whatsInside: [
            "Тижневий дашборд планування меню",
            "База рецептів",
            "Бібліотека інгредієнтів і нутрієнтів",
            "Система автоматизації списку покупок",
            "Трекер макро- та мікронутрієнтів",
            "Модуль виявлення дефіцитів",
            "Підтримка щитоподібної залози",
            "Харчування відповідно до фаз циклу",
          ],
          releasePlan: [
            "Ми завершуємо перший реліз і відкриватимемо доступ хвилями, щоб зберегти фокусований фідбек.",
            "Очікується влітку 2026.",
          ],
        },
      },
      pairsWithTitle: "Добре поєднується з",
      pairsWithOverrides: {
        "yearly-goals": {
          title: "Yearly Goals System",
          subtitle:
            "Безкоштовно · Спокійний, мінімалістичний робочий простір у Notion для річного планування.",
        },
      },
      seo: {
        title: "Nutrition Meal Planner — планер харчування в Notion",
        description:
          "Планер харчування в Notion для тижневого меню, списку покупок і відстеження нутрієнтів у спокійному ритмі.",
      },
    },
    "body-and-nutrition-tracker": {
      title: "Body & Nutrition Tracker",
      tags: ["ТРЕКІНГ ХАРЧУВАННЯ", "МІНІМАЛЬНА СИСТЕМА", "УСВІДОМЛЕНІСТЬ ТІЛА", "СПОКІЙНА СТРУКТУРА"],
      tagline:
        "Простий Notion-трекер для щотижневих чек-інів і автоматичного розрахунку цілей харчування. Відстежуйте прогрес без перевантаження у спокійній, підтримувальній системі.",
      description:
        "Простий Notion-трекер для тіла й харчування: щотижневі чек-іни, автоматичний розрахунок калорій і макросів та спокійний дашборд для щоденного використання.",
      shortDescription:
        "Простий Notion-трекер для чек-інів тіла й автоматичних цілей харчування.",
      statusBadgeText: "БЕЗКОШТОВНО",
      primaryCta: {
        type: "download",
        label: "Завантажити",
        helperText: "Працює у безкоштовній версії Notion.",
        endpoint: "/api/brevo/body-nutrition-download",
      },
      badge: { label: "Безкоштовно", tone: "soft" },
      bullets: [
        "Щотижневі чек-іни: вага, виміри та, за бажанням, сигнали тіла",
        "Автоматичний розрахунок калорій і макросів",
        "Обов’язкові лише вага та рівень активності",
        "Персональний дашборд створюється автоматично",
        "Відстеження прогресу в динаміці",
        "Дашборд зручно розмістити на головній сторінці",
        "Підтримка кількох профілів",
        "Лише 2 поля. Без перевантаження.",
      ],
      cta: "Завантажити",
      ctaLabel: "Завантажити",
      ctaNote: "Працює у безкоштовній версії Notion.",
      priceLabel: "Безкоштовно",
      detailsAccordion: [
        {
          id: "who-its-for",
          title: "Кому підійде",
          content: {
            bullets: [
              "тим, хто хоче просту систему трекінгу харчування",
              "тим, кого перевантажують складні трекери",
              "тим, хто хоче відстежувати зміни тіла без тиску",
              "усім, хто хоче чіткі цілі калорій і макросів без складного налаштування",
            ],
          },
        },
        {
          id: "whats-inside",
          title: "Що всередині",
          content: {
            bullets: [
              "створення профілю в кілька кліків",
              "автоматичний персональний дашборд",
              "система щотижневих чек-інів",
              "відстеження вимірів тіла",
              "опційний трекінг травлення й енергії",
              "автоматичні цілі харчування",
              "підтримка кількох профілів",
              "секція для наміру та рефлексії",
            ],
          },
        },
        {
          id: "how-it-works",
          title: "Як це працює",
          content: {
            ordered: [
              "створіть свій профіль",
              "заповніть ім’я, вік, зріст і стать",
              "додайте перший чек-ін",
              "вага та рівень активності — єдині обов’язкові поля",
              "натисніть «Update Targets»",
              "калорії та макроси розрахуються автоматично",
              "робіть чек-ін раз на тиждень, щоб бачити прогрес",
              "оновлюйте цілі після кожної зміни приблизно на 5 кг",
            ],
          },
        },
        {
          id: "release-plan",
          title: "План релізу",
          content: {
            paragraphs: [
              "Цей трекер є частиною більшої системи харчування, яка зараз у розробці.",
              "Згодом він природно поєднається з плануванням меню, бібліотекою інгредієнтів і глибшими інсайтами про харчування.",
            ],
          },
        },
      ],
      keyFeatures: [
        {
          title: "Мінімум вводу",
          descriptionShort: "Щоб почати, достатньо лише ваги та рівня активності.",
        },
        {
          title: "Автоматичні цілі",
          descriptionShort: "Калорії та макроси розраховуються автоматично.",
        },
        {
          title: "Щотижневі чек-іни",
          descriptionShort: "Відстежуйте зміни тіла простими щотижневими оновленнями.",
        },
        {
          title: "Персональний дашборд",
          descriptionShort: "Ключові цифри, нагадування й дії в одному місці.",
        },
        {
          title: "Зручно для головної сторінки",
          descriptionShort: "Охайний дашборд, який легко розмістити на головній сторінці Notion.",
        },
        {
          title: "Видимий прогрес",
          descriptionShort: "Чітко бачте зміни ваги й вимірів у часі.",
        },
        {
          title: "Опційні сигнали тіла",
          descriptionShort: "За бажанням відстежуйте травлення, енергію та інші патерни.",
        },
        {
          title: "Кілька профілів",
          descriptionShort: "Використовуйте систему для кількох людей в одному просторі.",
        },
      ],
      sections: {
        keyFeaturesSectionTitle: "Ключові можливості",
        keyFeaturesSectionSubtitle: "Спокійна система для простого й зрозумілого відстеження прогресу.",
      },
      pairsWithTitle: "Добре поєднується з",
      pairsWithOverrides: {
        "nutrition-meal-planner": {
          title: "Nutrition Meal Planner",
          subtitle: "Плануйте меню, відстежуйте нутрієнти й рухайтеся вперед м’яко та без перевантаження.",
        },
      },
      seo: {
        title: "Body & Nutrition Tracker",
        description:
          "Простий Notion-трекер для тіла й харчування: щотижневі чек-іни, автоматичний розрахунок калорій і макросів та спокійний дашборд для щоденного використання.",
      },
    },
  },
};

const getLocalizedConfig = (locale: Locale, slug: ProductSlug): ProductLocalizedConfig =>
  localizedProductConfigs[locale]?.[slug] ?? localizedProductConfigs[fallbackLocale][slug];

export const getProducts = (locale: Locale): ProductConfig[] =>
  productOrder.map((slug) => ({
    ...productStaticConfigs[slug],
    ...getLocalizedConfig(locale, slug),
  }));

export const getProductBySlug = (locale: Locale, slug: string): ProductConfig | undefined =>
  getProducts(locale).find((product) => product.slug === slug);

export const getAllProductSlugs = (): string[] => [...productOrder];

