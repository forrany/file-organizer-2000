import Stripe from "stripe";
import { db, UserUsageTable } from "../drizzle/schema";
import { eq, or, and } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

async function cleanupInactiveSubscriptions() {
  console.log("=== Cleaning Up Inactive Subscriptions ===\n");

  const stripeSubscriptions = new Map<string, Stripe.Subscription>();
  
  console.log("Fetching all Stripe subscriptions...");
  for await (const subscription of stripe.subscriptions.list({ limit: 100, status: 'all' })) {
    if (subscription.metadata?.userId) {
      stripeSubscriptions.set(subscription.metadata.userId, subscription);
    }
  }
  console.log(`Found ${stripeSubscriptions.size} subscriptions with userId metadata in Stripe\n`);

  const dbUsers = await db
    .select()
    .from(UserUsageTable)
    .where(
      and(
        or(
          eq(UserUsageTable.billingCycle, "monthly"),
          eq(UserUsageTable.billingCycle, "yearly"),
          eq(UserUsageTable.billingCycle, "subscription")
        ),
        or(
          eq(UserUsageTable.subscriptionStatus, "active"),
          eq(UserUsageTable.subscriptionStatus, "trialing")
        )
      )
    );

  console.log(`Found ${dbUsers.length} active subscription users in database\n`);

  let deactivated = 0;
  let kept = 0;
  let errors = 0;

  console.log("Processing users...\n");

  for (const user of dbUsers) {
    try {
      const stripeSubscription = stripeSubscriptions.get(user.userId);

      if (!stripeSubscription) {
        console.log(`✗ Deactivating ${user.userId} - No Stripe subscription found`);
        
        await db
          .update(UserUsageTable)
          .set({
            subscriptionStatus: "canceled",
            paymentStatus: "canceled",
            maxTokenUsage: 0,
          })
          .where(eq(UserUsageTable.userId, user.userId));

        deactivated++;
      } else if (!['active', 'trialing'].includes(stripeSubscription.status)) {
        console.log(`✗ Deactivating ${user.userId} - Stripe status: ${stripeSubscription.status}`);
        
        await db
          .update(UserUsageTable)
          .set({
            subscriptionStatus: stripeSubscription.status,
            paymentStatus: stripeSubscription.status,
            maxTokenUsage: 0,
          })
          .where(eq(UserUsageTable.userId, user.userId));

        deactivated++;
      } else {
        console.log(`✓ Keeping ${user.userId} - Active in Stripe (${stripeSubscription.status})`);
        kept++;
      }
    } catch (error) {
      console.error(`✗ Error processing ${user.userId}:`, error.message);
      errors++;
    }
  }

  console.log(`\n=== Cleanup Complete ===`);
  console.log(`✓ Kept active: ${kept}`);
  console.log(`✗ Deactivated: ${deactivated}`);
  console.log(`✗ Errors: ${errors}`);
  console.log(`Total processed: ${dbUsers.length}`);
}

cleanupInactiveSubscriptions().catch(console.error);
