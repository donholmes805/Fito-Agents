import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { aiServerService } from "@/services/ai.server";
import { UsageService } from "@/services/usage.server";
import { getPlanConfig } from "@/config/plans";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = 'force-dynamic';
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId: providedBusinessId, agentId, conversationId, visitorId, message, source } = body;

    // 1. Validation
    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 });
    }

    if (!agentId || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Fetch Agent & Derived Business ID
    const agentDoc = await adminDb.collection("agents").doc(agentId).get();
    if (!agentDoc.exists) {
        return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    const agent = agentDoc.data();
    const businessId = providedBusinessId || agent?.businessId;

    if (!businessId) {
        return NextResponse.json({ error: "Business ID not associated with agent" }, { status: 400 });
    }

    // 2. Billing & Plan Check
    const bizDoc = await adminDb.collection("businesses").doc(businessId).get();
    if (!bizDoc.exists) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }
    
    // Ensure usage period is current (trigger reset if expired)
    await UsageService.ensureUsagePeriodCurrent(businessId);
    
    // Refetch business if reset might have happened or just use the current data
    // For simplicity, we can refetch or just accept that the next request will have the updated values
    // But refetching is safer to avoid blocking a user who just had their period reset.
    const business = (await adminDb.collection("businesses").doc(businessId).get()).data();

    const isOwnerOverride = business?.ownerOverride === true;
    const isActive = ["active", "trial", "owner_override"].includes(business?.subscriptionStatus);
    
    if (!isOwnerOverride && !isActive) {
      return NextResponse.json({ 
        error: "subscription_inactive",
        message: "This AI agent is not currently available because the business subscription needs attention. Please contact the business directly." 
      }, { status: 403 });
    }

    const planConfig = getPlanConfig(business?.plan || "starter");
    const monthlyMessages = business?.monthlyMessagesUsed || 0;

    if (!isOwnerOverride && monthlyMessages >= planConfig.monthlyMessageLimit) {
      return NextResponse.json({ 
        error: "limit_reached",
        message: "The AI agent has reached its monthly message limit. Please try again later or upgrade your plan." 
      }, { status: 429 });
    }

    // 3. Handle Conversation
    let currentConversationId = conversationId;
    let history: any[] = [];

    if (currentConversationId) {
      // Fetch recent history
      const messagesSnapshot = await adminDb
        .collection("conversations")
        .doc(currentConversationId)
        .collection("messages")
        .orderBy("createdAt", "desc")
        .limit(10)
        .get();
      
      history = messagesSnapshot.docs.map(doc => doc.data()).reverse();
    } else {
      // Create new conversation
      const convRef = adminDb.collection("conversations").doc();
      currentConversationId = convRef.id;
      
      await convRef.set({
        id: currentConversationId,
        businessId,
        agentId,
        visitorId: visitorId || `anon-${Math.random().toString(36).substring(7)}`,
        status: "open",
        source: source || "hosted_page",
        startedAt: FieldValue.serverTimestamp(),
        lastMessageAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    // 3. Save Visitor Message
    const visitorMsgRef = adminDb
      .collection("conversations")
      .doc(currentConversationId)
      .collection("messages")
      .doc();
    
    await visitorMsgRef.set({
      id: visitorMsgRef.id,
      conversationId: currentConversationId,
      businessId,
      agentId,
      role: "visitor",
      content: message,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 4. Generate AI Response
    const aiResponse = await aiServerService.generateAgentResponse({
      businessId,
      agentId,
      conversationId: currentConversationId,
      message,
      source: source || "hosted_page",
      history
    });

    // 5. Save Assistant Message
    const assistantMsgRef = adminDb
      .collection("conversations")
      .doc(currentConversationId)
      .collection("messages")
      .doc();
    
    await assistantMsgRef.set({
      id: assistantMsgRef.id,
      conversationId: currentConversationId,
      businessId,
      agentId,
      role: "assistant",
      content: aiResponse.content,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 6. Update Conversation Timestamp
    await adminDb.collection("conversations").doc(currentConversationId).update({
      lastMessageAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // 7. Detect Intent for Frontend UI
    const hasLeadIntent = aiServerService.detectLeadIntent(message);

    return NextResponse.json({
      content: aiResponse.content,
      conversationId: currentConversationId,
      hasLeadIntent,
      isLimitReached: (aiResponse as any).isLimitReached || false
    });

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json({ 
      error: "Failed to process AI request",
      message: error.message 
    }, { status: 500 });
  }
}
