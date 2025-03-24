import { drizzle } from "drizzle-orm/vercel-postgres";
import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { eq, sql } from "drizzle-orm";
import { sql as psql } from "@vercel/postgres";

// Use this object to send drizzle queries to your DB
export const db = drizzle(psql);

// Table to store tier configurations
export const TierConfigTable = pgTable(
  "tier_config",
  {
    id: serial("id").primaryKey(),
    tierName: text("tier_name").notNull().unique(),
    maxTokens: integer("max_tokens").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
);

export type TierConfig = typeof TierConfigTable.$inferSelect;
export type NewTierConfig = typeof TierConfigTable.$inferInsert;

// Default free tier token limit
export const DEFAULT_FREE_TIER_TOKENS = 100000;

// Create a pgTable that maps to a table in your DB to track user usage
export const UserUsageTable = pgTable(
  "user_usage",
  {
    id: serial("id").primaryKey(),
    userId: text("userId").notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    billingCycle: text("billingCycle").notNull(),
    tokenUsage: integer("tokenUsage").notNull().default(0),
    maxTokenUsage: integer("maxTokenUsage").notNull().default(0),
    subscriptionStatus: text("subscriptionStatus")
      .notNull()
      .default("inactive"),
    paymentStatus: text("paymentStatus").notNull().default("unpaid"),
    lastPayment: timestamp("lastPayment"),
    // get rid of this
    currentProduct: text("currentProduct"),
    currentPlan: text("currentPlan"),
    hasCatalystAccess: boolean("hasCatalystAccess").notNull().default(false),
    tier: text("tier").notNull().default("free"), // Add tier field with default value of "free"
  },
  (userUsage) => {
    return {
      uniqueUserIdx: uniqueIndex("unique_user_idx").on(userUsage.userId),
    };
  }
);

// Table to track one-time Christmas token claims
export const christmasClaims = pgTable(
  "christmas_claims",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    claimedAt: timestamp("claimed_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      uniqueUserIdx: uniqueIndex("unique_christmas_claim_idx").on(table.userId),
    };
  }
);

export type ChristmasClaim = typeof christmasClaims.$inferSelect;

// Helper function to check if a user has claimed their Christmas tokens
export const hasClaimedChristmasTokens = async (userId: string): Promise<boolean> => {
  try {
    const claims = await db
      .select()
      .from(christmasClaims)
      .where(eq(christmasClaims.userId, userId))
      .limit(1);
    
    return claims.length > 0;
  } catch (error) {
    console.error("Error checking Christmas token claims:", error);
    return false;
  }
};

export const vercelTokens = pgTable('vercel_tokens', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull(),
  projectId: text('project_id'),
  deploymentUrl: text("deployment_url"),
  projectUrl: text("project_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastDeployment: timestamp("last_deployment"),
  modelProvider: text("model_provider").default('openai'),
  modelName: text("model_name").default('gpt-4o'),
  visionModelName: text("vision_model_name").default('gpt-4o'),
  lastApiKeyUpdate: timestamp("last_api_key_update"),
});

export type VercelToken = typeof vercelTokens.$inferSelect;
export type NewVercelToken = typeof vercelTokens.$inferInsert;

export const createEmptyUserUsage = async (userId: string) => {
  await db.insert(UserUsageTable).values({
    userId,
    billingCycle: "free",
    tokenUsage: 0,
    maxTokenUsage: DEFAULT_FREE_TIER_TOKENS,
    subscriptionStatus: "active", // Free tier is considered active
    paymentStatus: "free", // Free tier doesn't require payment
    tier: "free",
  });
};

// Initialize the tier config table with default values if none exist
export const initializeTierConfig = async () => {
  try {
    const existingTiers = await db.select().from(TierConfigTable).limit(1);
    
    if (existingTiers.length === 0) {
      // Insert default tier configurations
      await db.insert(TierConfigTable).values([
        {
          tierName: "free",
          maxTokens: DEFAULT_FREE_TIER_TOKENS,
          isActive: true,
        },
        {
          tierName: "paid",
          maxTokens: 1000000, // 1 million tokens for paid tier
          isActive: true,
        }
      ]);
      console.log("Initialized default tier configurations");
    }
  } catch (error) {
    console.error("Error initializing tier configurations:", error);
  }
};

// delete me
export async function incrementApiUsage(userId: string): Promise<void> {
  console.log("Incrementing API Usage for User ID:", userId);

  try {
    console.log("Incremented API Usage for User ID:", userId);
  } catch (error) {
    console.error("Error incrementing API Usage for User ID:", userId);
    console.error(error);
  }

  // Increment successful, exit the retry loop
}

// delete me
export const checkApiUsage = async (userId: string) => {
  console.log("Checking API Usage for User ID:", userId);
  try {
    return {
      remaining: 1000 - 0,

      usageError: false,
    };
  } catch (error) {
    console.error("Error checking API Usage for User ID:", userId);
    console.error(error);
    return {
      remaining: 0,
      usageError: true,
    };
  }
};

export async function incrementTokenUsage(
  userId: string,
  tokens: number
): Promise<{ remaining: number; usageError: boolean }> {
  try {
    // Validate tokens is a valid number
    if (Number.isNaN(tokens) || !Number.isFinite(tokens)) {
      console.warn(`Invalid token value received for user ${userId}: ${tokens}, using 0 instead`);
      tokens = 0;
    }
    
    // Ensure tokens is a non-negative integer
    tokens = Math.max(0, Math.floor(tokens));
    
    // First check if the user has a usage row
    const existingUsage = await db
      .select()
      .from(UserUsageTable)
      .where(eq(UserUsageTable.userId, userId))
      .limit(1);

    // If no usage row exists, create one with initial values
    if (existingUsage.length === 0) {
      await db.insert(UserUsageTable).values({
        userId,
        tokenUsage: 0,
        maxTokenUsage: 0, // Set default max tokens to 0 or another appropriate default
        billingCycle: "default", // Required field in the schema
        subscriptionStatus: "inactive",
        paymentStatus: "unpaid",
      });
    }

    // Now update the token usage
    const userUsage = await db
      .update(UserUsageTable)
      .set({
        tokenUsage: sql`${UserUsageTable.tokenUsage} + ${tokens}`,
      })
      .where(eq(UserUsageTable.userId, userId))
      .returning({
        remaining: sql<number>`${UserUsageTable.maxTokenUsage} - COALESCE(${UserUsageTable.tokenUsage}, 0)`,
      });

    console.log("Incremented token usage for user:", userId, userUsage[0]?.remaining, userUsage);
    return {
      remaining: userUsage[0]?.remaining ?? 0,
      usageError: false,
    };
  } catch (error) {
    console.error("Error incrementing token usage:", error);
    return {
      remaining: 0,
      usageError: true,
    };
  }
}

export const checkTokenUsage = async (userId: string) => {
  try {
    const userUsage = await db
      .select()
      .from(UserUsageTable)
      .where(eq(UserUsageTable.userId, userId))
      .limit(1);

    // If user doesn't exist yet, return default free tier tokens
    if (!userUsage.length) {
      console.log(`No user record found for ${userId} in checkTokenUsage, returning default free tier tokens`);
      return {
        remaining: DEFAULT_FREE_TIER_TOKENS,
        usageError: false,
      };
    }

    if (userUsage[0]?.tokenUsage >= userUsage[0]?.maxTokenUsage) {
      return {
        remaining: 0,
        usageError: false,
      };
    }

    return {
      remaining: userUsage[0]?.maxTokenUsage - userUsage[0]?.tokenUsage,
      usageError: false,
    };
  } catch (error) {
    console.error("Error checking token usage:", error);
    return {
      remaining: 0,
      usageError: true,
    };
  }
};

// check if has active subscription
export const checkUserSubscriptionStatus = async (userId: string) => {
  console.log("Checking subscription status for User ID:", userId);
  try {
    const userUsage = await db
      .select()
      .from(UserUsageTable)
      .where(eq(UserUsageTable.userId, userId))
      .limit(1)
      .execute();
    console.log("User Usage Results for User ID:", userId, userUsage);
    
    if (!userUsage[0]) {
      console.log(`No user record found for ${userId}, will be initialized with free tier`);
      return true; // Return true to allow initialization in ensureUserExists
    }

    // Check for free tier
    if (userUsage[0].tier === "free") {
      console.log(`User ${userId} is on free tier`);
      // For free tier, check if they have remaining tokens
      const tokenCheck = await checkTokenUsage(userId);
      return tokenCheck.remaining > 0;
    }

    // Check for paid tiers
    if (
      userUsage[0].paymentStatus === "paid" ||
      userUsage[0].paymentStatus === "succeeded" ||
      userUsage[0].paymentStatus === "free"
    ) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking subscription status for User ID:", userId);
    console.error(error);
    return false;
  }
};

export async function createOrUpdateUserSubscriptionStatus(
  userId: string,
  subscriptionStatus: string,
  paymentStatus: string,
  billingCycle: string,
  tier: string = "free"  // Default to free tier
): Promise<void> {
  try {
    // Get max tokens for tier from config
    const tierConfig = await db
      .select()
      .from(TierConfigTable)
      .where(eq(TierConfigTable.tierName, tier))
      .limit(1);
    
    // Default to free tier tokens if no config found
    const maxTokens = tierConfig.length > 0 
      ? tierConfig[0].maxTokens 
      : DEFAULT_FREE_TIER_TOKENS;
    
    await db
      .insert(UserUsageTable)
      .values({
        userId,
        subscriptionStatus,
        paymentStatus,
        billingCycle,
        tokenUsage: 0,
        maxTokenUsage: maxTokens,
        tier,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [UserUsageTable.userId],
        set: {
          subscriptionStatus,
          paymentStatus,
          billingCycle,
          tier,
          maxTokenUsage: maxTokens,
        },
      });

    console.log(
      `Updated or created subscription status for User ID: ${userId}`
    );
  } catch (error) {
    console.error(
      "Error updating or creating subscription status for User ID:",
      userId
    );
    console.error(error);
  }
}

export async function handleFailedPayment(
  userId: string,
  subscriptionStatus: string,
  paymentStatus: string
): Promise<void> {
  try {
    // Get the user's current tier
    const userUsage = await db
      .select()
      .from(UserUsageTable)
      .where(eq(UserUsageTable.userId, userId))
      .limit(1);
    
    // Determine if we need to drop down to free tier
    const shouldRevertToFreeTier = userUsage.length > 0 && 
      userUsage[0].tier !== "free" && 
      (paymentStatus === "failed" || subscriptionStatus === "inactive");
    
    // Set max tokens based on tier
    const maxTokens = shouldRevertToFreeTier ? 
      DEFAULT_FREE_TIER_TOKENS : 
      (userUsage.length > 0 ? userUsage[0].maxTokenUsage : DEFAULT_FREE_TIER_TOKENS);
    
    // Determine tier
    const tier = shouldRevertToFreeTier ? "free" : (userUsage.length > 0 ? userUsage[0].tier : "free");
    
    await db
      .insert(UserUsageTable)
      .values({
        userId,
        subscriptionStatus,
        paymentStatus,
        billingCycle: "",
        tokenUsage: userUsage.length > 0 ? userUsage[0].tokenUsage : 0,
        maxTokenUsage: maxTokens,
        tier,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [UserUsageTable.userId],
        set: {
          subscriptionStatus,
          paymentStatus,
          tier,
          maxTokenUsage: maxTokens,
        },
      });

    console.log(
      `Updated or created failed payment status for User ID: ${userId}`
    );
  } catch (error) {
    console.error(
      "Error updating or creating failed payment status for User ID:",
      userId
    );
    console.error(error);
  }
}

export const uploadedFiles = pgTable(
  "uploaded_files",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    blobUrl: text("blob_url").notNull(),
    fileType: text("file_type").notNull(), // "pdf" or "image"
    originalName: text("original_name").notNull(),
    status: text("status").notNull().default("pending"), // pending, processing, completed, error
    textContent: text("text_content"), // extracted text content
    tokensUsed: integer("tokens_used"), // tokens used for processing
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    error: text("error"), // error message if processing failed
  }
);

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type NewUploadedFile = typeof uploadedFiles.$inferInsert;

// Check if user needs to upgrade from free tier
export const checkIfUserNeedsUpgrade = async (userId: string): Promise<boolean> => {
  try {
    const userUsage = await db
      .select()
      .from(UserUsageTable)
      .where(eq(UserUsageTable.userId, userId))
      .limit(1);
    
    if (!userUsage.length) {
      return false;
    }
    
    // Check if they're on free tier and have used all their tokens
    if (userUsage[0].tier === "free" && userUsage[0].tokenUsage >= userUsage[0].maxTokenUsage) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking if user needs upgrade:", error);
    return false;
  }
};
