export type BrevoActionKey =
  | "subscribe"
  | "yearly_goals_download"
  | "body_nutrition_download"
  | "nutrition_waitlist"
  | "body_nutrition_waitlist";

export type BrevoActionConfig = {
  listIdsToAdd: number[];
  tagsToAdd: string[];
  sendTemplateId?: number;
  attributes?: Record<string, string>;
  templateParams?: Record<string, string>;
};

export const brevoConfig = {
  lists: {
    main: 3,
    yearlyGoals: 6,
    nutritionWaitlist: 7,
  },
  templates: {
    productDownload: 6,
    nutritionWaitlist: 5,
  },
  actions: {
    subscribe: {
      listIdsToAdd: [3],
      tagsToAdd: ["source:website", "intent:subscribe"],
    },
    yearly_goals_download: {
      listIdsToAdd: [3, 6],
      tagsToAdd: ["source:website", "product:yearly-goals", "intent:download"],
      sendTemplateId: 6,
      templateParams: {
        product_name: "Yearly Goals",
        access_url:
          "https://teti-studio.notion.site/Yearly-Goals-b1ff0b2ed5c2825a9c3c01fdba76beb9?source=copy_link",
      },
    },
    body_nutrition_download: {
      listIdsToAdd: [3],
      tagsToAdd: ["source:website", "product:body-and-nutrition-tracker", "intent:download"],
      sendTemplateId: 6,
      templateParams: {
        product_name: "Body & Nutrition Tracker",
        access_url:
          "https://teti-studio.notion.site/Body-Nutrition-Tracker-33af0b2ed5c280cdb792d9a6efd823b0?source=copy_link",
      },
    },
    nutrition_waitlist: {
      listIdsToAdd: [3, 7],
      tagsToAdd: [
        "source:website",
        "product:nutrition-meal-planner",
        "intent:waitlist",
      ],
      sendTemplateId: 5,
      attributes: {
        WAITLIST_PRODUCT: "Nutrition Meal Planner",
        WAITLIST_SOURCE: "website",
        WAITLIST_RELEASE: "2026-03-29",
      },
      templateParams: {
        PRODUCT_NAME: "Nutrition Meal Planner",
        RELEASE_DATE: "March 29",
      },
    },
    body_nutrition_waitlist: {
      listIdsToAdd: [3],
      tagsToAdd: [
        "source:website",
        "product:body-and-nutrition-tracker",
        "intent:waitlist",
      ],
      attributes: {
        WAITLIST_PRODUCT: "Body & Nutrition Tracker",
        WAITLIST_SOURCE: "website",
      },
    },
  } satisfies Record<BrevoActionKey, BrevoActionConfig>,
} as const;
