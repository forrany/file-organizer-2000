import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

async function checkStripeData() {
  console.log("Checking Stripe account data...\n");

  const customers = await stripe.customers.list({ limit: 10 });
  console.log(`Customers (first 10): ${customers.data.length}`);
  console.log(`Total customers: ${customers.has_more ? '10+' : customers.data.length}`);

  const paymentIntents = await stripe.paymentIntents.list({ limit: 10 });
  console.log(`\nPayment Intents (first 10): ${paymentIntents.data.length}`);
  console.log(`Total payment intents: ${paymentIntents.has_more ? '10+' : paymentIntents.data.length}`);

  const invoices = await stripe.invoices.list({ limit: 10 });
  console.log(`\nInvoices (first 10): ${invoices.data.length}`);
  console.log(`Total invoices: ${invoices.has_more ? '10+' : invoices.data.length}`);

  const subscriptions = await stripe.subscriptions.list({ limit: 10, status: 'all' });
  console.log(`\nSubscriptions (all statuses, first 10): ${subscriptions.data.length}`);
  console.log(`Total subscriptions: ${subscriptions.has_more ? '10+' : subscriptions.data.length}`);

  if (subscriptions.data.length > 0) {
    console.log("\nRecent subscriptions:");
    subscriptions.data.slice(0, 5).forEach(sub => {
      console.log(`  - ${sub.id}: ${sub.status} (userId: ${sub.metadata?.userId || 'none'})`);
    });
  }

  const account = await stripe.accounts.retrieve();
  console.log(`\nStripe Account: ${account.id}`);
  console.log(`Email: ${account.email || 'not set'}`);
  console.log(`Type: ${account.type}`);
  console.log(`Charges enabled: ${account.charges_enabled}`);
}

checkStripeData().catch(console.error);
