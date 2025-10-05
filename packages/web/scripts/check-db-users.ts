import { db, UserUsageTable } from "../drizzle/schema";
import { eq, or, sql } from "drizzle-orm";

async function checkDatabaseUsers() {
  console.log("Checking database user distribution...\n");

  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(UserUsageTable);
  console.log(`Total users in database: ${totalUsers[0].count}\n`);

  const billingCycles = await db
    .select({
      billingCycle: UserUsageTable.billingCycle,
      count: sql<number>`count(*)`,
    })
    .from(UserUsageTable)
    .groupBy(UserUsageTable.billingCycle);

  console.log("Billing cycle distribution:");
  billingCycles.forEach(({ billingCycle, count }) => {
    console.log(`  ${billingCycle}: ${count}`);
  });

  const statuses = await db
    .select({
      status: UserUsageTable.subscriptionStatus,
      count: sql<number>`count(*)`,
    })
    .from(UserUsageTable)
    .groupBy(UserUsageTable.subscriptionStatus);

  console.log("\nSubscription status distribution:");
  statuses.forEach(({ status, count }) => {
    console.log(`  ${status}: ${count}`);
  });

  const subscriptionUsers = await db
    .select()
    .from(UserUsageTable)
    .where(
      or(
        eq(UserUsageTable.billingCycle, "monthly"),
        eq(UserUsageTable.billingCycle, "yearly"),
        eq(UserUsageTable.billingCycle, "subscription")
      )
    )
    .limit(10);

  console.log("\nSample subscription users:");
  subscriptionUsers.forEach(user => {
    console.log(`  ${user.userId}: ${user.billingCycle} - ${user.subscriptionStatus} (${user.maxTokenUsage} tokens)`);
  });

  const activeRecurring = await db
    .select({ count: sql<number>`count(*)` })
    .from(UserUsageTable)
    .where(
      sql`${UserUsageTable.billingCycle} IN ('monthly', 'yearly', 'subscription') 
          AND ${UserUsageTable.subscriptionStatus} = 'active'`
    );

  console.log(`\nActive recurring subscription users: ${activeRecurring[0].count}`);
}

checkDatabaseUsers().catch(console.error);
