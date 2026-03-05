export type BrevoActionKey =
  | "subscribe"
  | "yearly_goals_download"
  | "nutrition_waitlist";

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
    yearlyGoalsDownload: 2,
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
      sendTemplateId: 2,
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
  } satisfies Record<BrevoActionKey, BrevoActionConfig>,
} as const;
