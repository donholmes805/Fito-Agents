import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { EmailService } from "@/services/email.server";
import { Agent, Business, Lead } from "@/types";

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
        agentId, 
        conversationId, 
        name, 
        email, 
        phone, 
        serviceRequested, 
        message, 
        source 
    } = body;

    if (!adminDb) {
      return NextResponse.json({ error: "Firebase Admin not configured" }, { status: 500 });
    }

    if (!agentId || !name || (!email && !phone)) {
      return NextResponse.json({ error: "Missing required fields (agentId, name, and either email or phone)" }, { status: 400 });
    }

    // 1. Fetch Agent to get businessId
    const agentDoc = await adminDb.collection("agents").doc(agentId).get();
    if (!agentDoc.exists) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    const agentData = agentDoc.data() as Agent;
    const businessId = agentData?.businessId;

    if (!businessId) {
      return NextResponse.json({ error: "Business ID not associated with agent" }, { status: 400 });
    }

    // 2. Create Lead
    const leadRef = adminDb.collection("leads").doc();
    const leadId = leadRef.id;

    const timestamp = new Date().toISOString();
    const leadData: any = {
      id: leadId,
      businessId,
      agentId,
      conversationId: conversationId || "",
      name,
      email: email || "",
      phone: phone || "",
      serviceRequested: serviceRequested || "",
      message: message || "",
      source: source || "embed_widget",
      status: "new",
      createdAt: timestamp, // Using string for service compatibility
      updatedAt: timestamp,
    };

    // Use server timestamp for Firestore
    const firestoreData = {
        ...leadData,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
    };

    await leadRef.set(firestoreData);

    // 3. Update Conversation if applicable
    if (conversationId) {
      await adminDb.collection("conversations").doc(conversationId).update({
        leadId: leadId,
        status: "lead_captured",
        updatedAt: FieldValue.serverTimestamp()
      });
    }

    // 4. Send Email Notification (Background/Non-blocking)
    if (source !== 'dashboard_preview') {
        try {
            // Fetch Business
            const businessDoc = await adminDb.collection("businesses").doc(businessId).get();
            const businessData = businessDoc.data() as Business;

            if (businessData) {
                // Determine recipient
                let recipientEmail = agentData.escalationEmail || businessData.email;

                // Fallback to owner profile if needed
                if (!recipientEmail && businessData.ownerId) {
                    const ownerDoc = await adminDb.collection("users").doc(businessData.ownerId).get();
                    recipientEmail = ownerDoc.data()?.email;
                }

                if (recipientEmail) {
                    const emailResult = await EmailService.sendNewLeadNotification({
                        business: businessData,
                        agent: agentData,
                        lead: leadData,
                        recipientEmail
                    });

                    // Update Lead with notification status
                    await leadRef.update({
                        notificationEmailSent: emailResult.success,
                        notificationEmailSentAt: emailResult.success ? new Date().toISOString() : null,
                        notificationEmailError: emailResult.success ? null : emailResult.error,
                        updatedAt: FieldValue.serverTimestamp()
                    });
                } else {
                    console.warn(`No recipient email found for lead ${leadId} in business ${businessId}`);
                    await leadRef.update({
                        notificationEmailSent: false,
                        notificationEmailError: 'No recipient email found',
                        updatedAt: FieldValue.serverTimestamp()
                    });
                }
            }
        } catch (emailError: any) {
            console.error("Email Notification Error:", emailError);
            await leadRef.update({
                notificationEmailSent: false,
                notificationEmailError: emailError.message,
                updatedAt: FieldValue.serverTimestamp()
            });
        }
    }

    return NextResponse.json({ success: true, leadId });

  } catch (error: any) {
    console.error("Lead Creation Error:", error);
    return NextResponse.json({ 
      error: "Failed to create lead",
      message: error.message 
    }, { status: 500 });
  }
}
