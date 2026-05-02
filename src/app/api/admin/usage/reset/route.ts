import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { UsageService } from "@/services/usage.server";
import { UserProfile } from "@/types";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, actorId } = body;

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 });
    }

    if (!businessId || !actorId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Verify actor is owner or admin
    const actorDoc = await adminDb.collection("users").doc(actorId).get();
    if (!actorDoc.exists) {
      return NextResponse.json({ error: "Actor profile not found" }, { status: 403 });
    }
    const actor = actorDoc.data() as UserProfile;
    if (actor.role !== 'owner' && actor.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized: Admin privileges required" }, { status: 403 });
    }

    // 2. Perform reset
    const result = await UsageService.resetBusinessUsage(businessId, `manual_reset_by_${actor.email}`);

    if (result.success) {
      // 3. Log the administrative action
      const auditLogRef = adminDb.collection("auditLogs").doc();
      await auditLogRef.set({
        id: auditLogRef.id,
        actorId,
        action: "MANUAL_USAGE_RESET",
        targetType: "business",
        targetId: businessId,
        metadata: {
            actorEmail: actor.email,
            reason: "Manual administrative reset"
        },
        createdAt: new Date().toISOString()
      });

      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Manual Reset API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
