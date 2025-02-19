//
export type SubscriptionWebhookEvent =
  | "checkout.session.completed"
  | "customer.created"
  | "customer.subscription.created"
  | "customer.subscription.deleted"
  | "customer.subscription.paused"
  | "customer.subscription.resumed"
  | "customer.subscription.trial_will_end"
  | "customer.subscription.updated"
  | "entitlements.active_entitlement_summary.updated"
  | "invoice.created"
  | "invoice.finalized"
  | "invoice.finalization_failed"
  | "invoice.paid"
  | "invoice.payment_action_required"
  | "invoice.payment_failed"
  | "invoice.upcoming"
  | "invoice.updated"
  | "payment_intent.created"
  | "payment_intent.succeeded"
  | "subscription_schedule.aborted"
  | "subscription_schedule.canceled"
  | "subscription_schedule.completed"
  | "subscription_schedule.created"
  | "subscription_schedule.expiring"
  | "subscription_schedule.released"
  | "subscription_schedule.updated";

// Product and plan types for type safety
export type ProductType = "subscription" | "lifetime" | "top_up";
export type Plan =
  | "monthly"
  | "yearly"
  | "lifetime_license"
  | "one_year_license"
  | "top_up";
export type PlanType = "subscription" | "pay-once";

// Pricing configuration
export const PRICES = {
  MONTHLY: 1500, // $15.00
  YEARLY: 11900, // $119.00
  LIFETIME: 30000, // $300.00
  ONE_YEAR: 20000, // $200.00
  TOP_UP: 1500, // $15.00
} as const;

const cloudFeatures = [
  "No external AI credits needed",
  "Seamless no-sweat setup",
  "~1000 files per month",
  "300 min audio transcription p/m",
  "Support",
  "30 days money-back guarantee",
];

const standardPayOnceFeatures = [
  "Requires your own openAI api key (pay as you go)",
  "Privacy-focused",
  "Quick guided setup",
  "Unlimited usage",
  "Early access features",
  "Premium support",
  "Onboarding call with one of the founders (on request)",
  "30 days money-back guarantee",

];

export interface ProductMetadata {
  type: PlanType;
  plan: Plan;
}

// Product metadata configuration
export const PRODUCTS = {
  SubscriptionMonthly: {
    name: "Note Companion - Cloud",
    metadata: {
      type: "subscription",
      plan: "monthly",
    } as ProductMetadata,
    prices: {
      monthly: {
        amount: PRICES.MONTHLY,
        interval: "month" as const,
        type: "recurring" as const,
      },
    },
    features: cloudFeatures,
  },
  SubscriptionYearly: {
    name: "Note Companion - Cloud",
    metadata: {
      type: "subscription" as PlanType,
      plan: "subscription_yearly" as Plan,
    },
    prices: {
      yearly: {
        amount: PRICES.YEARLY,
        interval: "year" as const,
        type: "recurring" as const,
        trialPeriodDays: 7,
      },
    },
    features: [...cloudFeatures, "Save 33% compared to monthly"],
  },
  PayOnceLifetime: {
    name: "Note Companion - Lifetime",
    metadata: {
      type: "pay-once" as PlanType,
      plan: "lifetime_license" as Plan,
    },
    prices: {
      lifetime: {
        amount: PRICES.LIFETIME,
        type: "one_time" as const,
        interval: "one_time" as const,
      },
    },
    features: [...standardPayOnceFeatures, "Multiple License Forever"],
  },
  PayOnceOneYear: {
    name: "Note Companion - Lifetime",
    metadata: {
      type: "pay-once" as PlanType,
      plan: "one_year_license" as Plan,
    },
    prices: {
      one_year: {
        amount: PRICES.ONE_YEAR,
        type: "one_time" as const,
      },
    },
    features: [...standardPayOnceFeatures, "One Year of Updates"],
  },
  PayOnceTopUp: {
    name: "Note Companion - Top Up",
    metadata: {
      type: "pay-once" as PlanType,
      plan: "top_up" as Plan,
    },
    prices: {
      top_up: {
        amount: PRICES.TOP_UP,
        type: "one_time" as const,
      },
    },
    features: ["One-time purchase of additional tokens"],
  },
} as const;

// Helper to get URLs based on environment
export const getTargetUrl = () => {
  if (process.env.VERCEL_ENV === "production") {
    return process.env.VERCEL_PROJECT_PRODUCTION_URL;
  }
  if (process.env.VERCEL_ENV === "preview") {
    return process.env.VERCEL_PROJECT_PREVIEW_URL;
  }
  return "localhost:3010";
};

// Helper to validate webhook metadata
export const validateWebhookMetadata = (metadata: any) => {
  if (!metadata?.userId) {
    console.warn("Missing userId in webhook metadata");
    return false;
  }
  if (!metadata?.type) {
    console.warn("Missing type in webhook metadata");
    return false;
  }
  return true;
};

// Export the full config
export const config = {
  products: PRODUCTS,
};

// Type helpers for webhook handlers
export type WebhookMetadata = {
  userId: string;
  type: ProductType;
  plan: Plan;
};

export type WebhookEventType = SubscriptionWebhookEvent;
