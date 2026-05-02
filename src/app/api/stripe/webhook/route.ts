import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";
import { UsageService } from "@/services/usage.server";
import Stripe from "stripe";

export const dynamic = 'force-dynamic';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) throw new Error("Missing signature or secret");
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  const session = event.data.object as any;

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(session);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(session);
        break;
      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(session);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(session);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`Webhook handler failed: ${err.message}`);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const businessId = session.metadata?.businessId;
  const ownerId = session.metadata?.ownerId;

  if (!businessId || !ownerId) return;

  await adminDb.collection("businesses").doc(businessId).update({
    stripeCustomerId: session.customer as string,
    setupFeeStatus: "paid",
    updatedAt: new Date().toISOString(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const businessId = subscription.metadata?.businessId;
  const ownerId = subscription.metadata?.ownerId;
  const plan = subscription.metadata?.plan || "starter";

  if (!businessId || !ownerId) return;

  const currentPeriodStart = new Date((subscription as any).current_period_start * 1000).toISOString();
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000).toISOString();

  const subscriptionData = {
    id: subscription.id,
    businessId,
    ownerId,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    stripePriceId: subscription.items.data[0].price.id,
    stripeProductId: subscription.items.data[0].price.product as string,
    plan: plan as any,
    status: subscription.status as any,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    setupFeeStatus: "paid",
    ownerOverride: false,
    updatedAt: new Date().toISOString(),
  };

  await adminDb.collection("subscriptions").doc(subscription.id).set(subscriptionData, { merge: true });

  await adminDb.collection("businesses").doc(businessId).update({
    plan: plan as any,
    subscriptionStatus: subscription.status as any,
    stripeSubscriptionId: subscription.id,
    currentPeriodStart,
    currentPeriodEnd,
    nextUsageResetAt: currentPeriodEnd,
    updatedAt: new Date().toISOString(),
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const businessId = subscription.metadata?.businessId;
  if (!businessId) return;

  await adminDb.collection("subscriptions").doc(subscription.id).update({
    status: "canceled",
    updatedAt: new Date().toISOString(),
  });

  await adminDb.collection("businesses").doc(businessId).update({
    subscriptionStatus: "canceled",
    updatedAt: new Date().toISOString(),
  });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    if (!(invoice as any).subscription) return;
    const subId = (invoice as any).subscription as string;
    
    // 1. Mark subscription as active
    await adminDb.collection("subscriptions").doc(subId).update({
        status: "active",
        updatedAt: new Date().toISOString()
    });

    // 2. Trigger Usage Reset for the business
    const subDoc = await adminDb.collection("subscriptions").doc(subId).get();
    if (subDoc.exists) {
        const businessId = subDoc.data()?.businessId;
        if (businessId) {
            // Check if this is a renewal (billing_reason: 'subscription_cycle')
            // or just ensure we reset if the payment is for the new period
            const billingReason = invoice.billing_reason;
            
            if (billingReason === 'subscription_cycle') {
                await UsageService.resetBusinessUsage(businessId, "stripe_invoice_payment_succeeded");
            }
        }
    }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
    if (!(invoice as any).subscription) return;
    const subId = (invoice as any).subscription as string;
    
    await adminDb.collection("subscriptions").doc(subId).update({
        status: "past_due",
        updatedAt: new Date().toISOString()
    });

    const subDoc = await adminDb.collection("subscriptions").doc(subId).get();
    if (subDoc.exists) {
        const businessId = subDoc.data()?.businessId;
        if (businessId) {
            await adminDb.collection("businesses").doc(businessId).update({
                subscriptionStatus: "past_due",
                updatedAt: new Date().toISOString()
            });
        }
    }
}
