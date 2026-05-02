import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { adminDb } from "@/lib/firebase/admin";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const stripe = getStripe();
    const { businessId, userId } = await req.json();

    if (!businessId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bizDoc = await adminDb.collection("businesses").doc(businessId).get();
    if (!bizDoc.exists) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    const business = bizDoc.data();

    if (business?.ownerId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!business?.stripeCustomerId) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: business.stripeCustomerId,
      return_url: `${APP_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
