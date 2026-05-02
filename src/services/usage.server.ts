import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { Business, Agent } from "@/types";

/**
 * Usage Service (Server-side only)
 */
export const UsageService = {
  /**
   * Reset usage for all agents in a business
   */
  async resetBusinessUsage(businessId: string, reason: string) {
    if (!adminDb) return { success: false, error: "Firebase Admin not configured" };

    try {
      const now = new Date().toISOString();
      const businessRef = adminDb.collection("businesses").doc(businessId);
      const businessDoc = await businessRef.get();
      
      if (!businessDoc.exists) return { success: false, error: "Business not found" };
      const business = businessDoc.data() as Business;

      // 1. Update all active agents for this business
      const agentsSnapshot = await adminDb.collection("agents")
        .where("businessId", "==", businessId)
        .where("status", "==", "active")
        .get();

      const batch = adminDb.batch();

      agentsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          monthlyMessagesUsed: 0,
          lastUsageResetAt: now,
          updatedAt: FieldValue.serverTimestamp()
        });
      });

      // 2. Update business profile
      batch.update(businessRef, {
        monthlyMessagesUsed: 0,
        lastUsageResetAt: now,
        usageWarning80SentAt: null,
        usageWarning100SentAt: null,
        lastUsageWarningLevel: 0,
        // nextUsageResetAt should be set by the caller (e.g. from Stripe period)
        updatedAt: FieldValue.serverTimestamp()
      });

      // 3. Create usage log entry
      const logRef = adminDb.collection("usageLogs").doc();
      batch.set(logRef, {
        id: logRef.id,
        businessId,
        type: "usage_reset",
        resetReason: reason,
        messagesUsed: 0,
        createdAt: FieldValue.serverTimestamp()
      });

      await batch.commit();
      
      console.log(`Usage reset for business ${businessId}. Reason: ${reason}`);
      return { success: true };
    } catch (error: any) {
      console.error("Usage Reset Error:", error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Ensure business usage period is current
   * Triggers a reset if nextUsageResetAt has passed
   */
  async ensureUsagePeriodCurrent(businessId: string) {
    if (!adminDb) return;

    const businessDoc = await adminDb.collection("businesses").doc(businessId).get();
    if (!businessDoc.exists) return;

    const business = businessDoc.data() as Business;
    const now = new Date();
    
    if (business.nextUsageResetAt && new Date(business.nextUsageResetAt) <= now) {
      // Period has expired, reset usage
      // For automated fallback, we set the next reset to +1 month from now 
      // unless Stripe sync handles it later
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);
      
      await this.resetBusinessUsage(businessId, "scheduled_reset_fallback");
      
      await adminDb.collection("businesses").doc(businessId).update({
        nextUsageResetAt: nextReset.toISOString(),
        updatedAt: FieldValue.serverTimestamp()
      });
    }
  }
};
