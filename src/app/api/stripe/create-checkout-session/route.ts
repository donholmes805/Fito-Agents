import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const PRICE_IDS: Record<string, string | undefined> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID,
  business: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
  advanced: process.env.NEXT_PUBLIC_STRIPE_ADVANCED_PRICE_ID,
};

const SETUP_FEE_IDS: Record<string, string | undefined> = {
  starter: process.env.STRIPE_STARTER_SETUP_PRICE_ID,
  business: process.env.STRIPE_BUSINESS_SETUP_PRICE_ID,
  advanced: process.env.STRIPE_ADVANCED_SETUP_PRICE_ID,
};

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { plan, businessId, userId } = await req.json();

    if (!plan || !businessId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // 1. Fetch Business & User to verify
    const bizDoc = await adminDb.collection("businesses").doc(businessId).get();
    if (!bizDoc.exists) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    const business = bizDoc.data();

    // Verify ownership (simplified for Phase 3A, usually check userId matches ownerId)
    if (business?.ownerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 2. Prepare line items
    const lineItems: any[] = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    // Add setup fee if not already paid
    if (business?.setupFeeStatus !== "paid") {
      const setupFeeId = SETUP_FEE_IDS[plan];
      if (setupFeeId) {
        lineItems.push({
          price: setupFeeId,
          quantity: 1,
        });
      }
    }

    // 3. Create or reuse Stripe customer
    let stripeCustomerId = business?.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: business?.email,
        name: business?.name,
        metadata: {
          businessId,
          ownerId: userId,
        },
      });
      stripeCustomerId = customer.id;
      
      // Update business with customer ID
      await adminDb.collection("businesses").doc(businessId).update({
        stripeCustomerId,
        updatedAt: new Date().toISOString(),
      });
    }

    // 4. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${APP_URL}/dashboard/billing?checkout=success`,
      cancel_url: `${APP_URL}/dashboard/billing?checkout=cancelled`,
      metadata: {
        businessId,
        ownerId: userId,
        plan,
      },
      subscription_data: {
          metadata: {
            businessId,
            ownerId: userId,
            plan,
          }
      }
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
