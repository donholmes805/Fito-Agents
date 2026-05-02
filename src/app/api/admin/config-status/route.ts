import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET() {
  return NextResponse.json({
    openRouter: {
      isSet: !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY !== 'sk-or-v1-placeholder',
      model: process.env.OPENROUTER_DEFAULT_MODEL || "anthropic/claude-3-haiku",
    },
    firebaseAdmin: {
      isSet: !!adminDb,
    },
    stripe: {
      isSet: !!process.env.STRIPE_SECRET_KEY,
    },
    resend: {
      isSet: !!process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'notifications@fitoagents.com'
    }
  });
}
