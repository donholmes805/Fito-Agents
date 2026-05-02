import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { UsageService } from "@/services/usage.server";

export const dynamic = 'force-dynamic';

/**
 * Daily CRON job to reset usage for businesses with expired periods
 * Should be called by a scheduler (e.g. Vercel Cron, GitHub Actions, or Firebase Scheduled Function)
 * Protected by CRON_SECRET header
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  if (!adminDb) return new NextResponse('Firebase Admin not configured', { status: 500 });

  try {
    const now = new Date();
    
    // Find businesses whose usage reset is overdue
    // We only reset active/trial/override status businesses
    const overdueSnapshot = await adminDb.collection("businesses")
      .where("nextUsageResetAt", "<=", now.toISOString())
      .get();

    const results = [];

    for (const doc of overdueSnapshot.docs) {
      const businessId = doc.id;
      const businessData = doc.data();
      
      // Basic protection: only reset if not recently reset (prevent infinite loops if something goes wrong)
      const lastReset = businessData.lastUsageResetAt ? new Date(businessData.lastUsageResetAt) : null;
      const oneHourAgo = new Date(Date.now() - 3600000);
      
      if (lastReset && lastReset > oneHourAgo) {
        continue;
      }

      await UsageService.ensureUsagePeriodCurrent(businessId);
      results.push(businessId);
    }

    return NextResponse.json({ 
        success: true, 
        processed: overdueSnapshot.size, 
        resetCount: results.length,
        resetBusinessIds: results
    });

  } catch (error: any) {
    console.error("Cron Usage Reset Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
