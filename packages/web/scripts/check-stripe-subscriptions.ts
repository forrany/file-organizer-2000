import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

async function checkStripeSubscriptions() {
  console.log("Checking Stripe subscriptions...\n");

  const activeSubscriptions: Stripe.Subscription[] = [];
  const allSubscriptions: Stripe.Subscription[] = [];

  for await (const subscription of stripe.subscriptions.list({ limit: 100 })) {
    allSubscriptions.push(subscription);
    if (['active', 'trialing'].includes(subscription.status)) {
      activeSubscriptions.push(subscription);
    }
  }

  console.log(`Total subscriptions in Stripe: ${allSubscriptions.length}`);
  console.log(`Active subscriptions: ${activeSubscriptions.length}`);
  console.log(`Other statuses: ${allSubscriptions.length - activeSubscriptions.length}\n`);

  console.log("Status breakdown:");
  const statusCount: Record<string, number> = {};
  allSubscriptions.forEach(sub => {
    statusCount[sub.status] = (statusCount[sub.status] || 0) + 1;
  });
  Object.entries(statusCount).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  console.log("\nActive subscriptions with userId metadata:");
  let withMetadata = 0;
  let withoutMetadata = 0;

  activeSubscriptions.forEach(sub => {
    if (sub.metadata?.userId) {
      console.log(`  ✓ ${sub.metadata.userId} - ${sub.status} (${sub.items.data[0]?.price?.recurring?.interval})`);
      withMetadata++;
    } else {
      console.log(`  ✗ [No userId] - ${sub.id} - ${sub.status}`);
      withoutMetadata++;
    }
  });

  console.log(`\nWith userId metadata: ${withMetadata}`);
  console.log(`Without userId metadata: ${withoutMetadata}`);
}

checkStripeSubscriptions().catch(console.error);
