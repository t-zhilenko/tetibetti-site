export type ProductStatus = "available" | "coming_soon";

export type ProductImage = {
  src: string;
  alt: string;
  objectPosition?: string;
};

export type Product = {
  title: string;
  slug: string;
  short: string;
  subtitle?: string;
  priceLabel: string;
  status: ProductStatus;
  eta?: string;
  cta: string;
  ctaLabel?: string;
  mainPreviewImage: ProductImage;
  galleryImages?: ProductImage[];
};

export const products: Product[] = [
  {
    title: "Yearly Goals",
    slug: "yearly-goals",
    short: "Minimal Notion system for yearly planning & weekly clarity.",
    subtitle:
      "A calm, minimalist Notion workspace for yearly planning. Map priorities, track progress, and keep your goals visible without noise.",
    priceLabel: "Free download",
    status: "available",
    cta: "Get now",
    ctaLabel: "Download",
    mainPreviewImage: {
      src: "/images/yearly-goals/main-pveview.png",
      alt: "Yearly Goals preview",
    },
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
  },
  {
    title: "Nutrition System / Meal Planner",
    slug: "nutrition-system",
    short: "A structured meal planner + nutrition tracking system.",
    priceLabel: "Estimated delivery: 20 March",
    status: "coming_soon",
    cta: "Coming soon",
    mainPreviewImage: {
      src: "/images/products/nutrition-system.jpg",
      alt: "Nutrition System preview",
    },
  },
  {
    title: "Java Cheat Sheets",
    slug: "java-cheat-sheets",
    short: "Practical Java notes + interview-ready cheat sheets.",
    priceLabel: "Estimated delivery: 15 April",
    status: "coming_soon",
    cta: "Coming soon",
    mainPreviewImage: {
      src: "/images/products/java-cheat-sheets.jpg",
      alt: "Java Cheat Sheets preview",
    },
  },
];

export const getProductBySlug = (slug: string) =>
  products.find((product) => product.slug === slug);
