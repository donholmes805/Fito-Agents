import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  limit,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { 
  Business, 
  Agent, 
  AuditLog, 
  KnowledgeItem, 
  Conversation, 
  Message, 
  Lead,
  UserProfile,
  UserRole
} from "@/types";

// --- Business Service ---
export const businessService = {
  async createBusiness(ownerId: string, data: Partial<Business>) {
    const businessId = doc(collection(db, "businesses")).id;
    const slug = data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || businessId;
    
    const businessData: Business = {
      id: businessId,
      ownerId,
      name: data.name || "",
      slug,
      website: data.website || "",
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      businessHours: data.businessHours || "",
      serviceArea: data.serviceArea || "",
      industry: data.industry || "",
      description: data.description || "",
      plan: "starter",
      subscriptionStatus: "trial",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    await setDoc(doc(db, "businesses", businessId), {
      ...businessData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return businessData;
  },

  async getBusinessById(businessId: string) {
    const docRef = doc(db, "businesses", businessId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Business;
    }
    return null;
  },

  async getBusinessBySlug(slug: string) {
    const q = query(collection(db, "businesses"), where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as Business;
    }
    return null;
  },

  async updateBusiness(businessId: string, data: Partial<Business>) {
    const docRef = doc(db, "businesses", businessId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async getBusinessesForAdmin() {
    const q = query(collection(db, "businesses"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Business);
  },

  async updateBusinessAdmin(businessId: string, data: Partial<Business>) {
    const docRef = doc(db, "businesses", businessId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  }
};

// --- Agent Service ---
export const agentService = {
  async createAgent(businessId: string, data: Partial<Agent>) {
    const agentId = doc(collection(db, "agents")).id;
    
    const agentData: Agent = {
      id: agentId,
      businessId,
      name: data.name || "New Agent",
      type: data.type || "website",
      status: "active",
      greeting: data.greeting || "Hello! How can I help you today?",
      tone: data.tone || "professional",
      brandColor: data.brandColor || "#2563eb",
      widgetPosition: data.widgetPosition || "bottom-right",
      fallbackMessage: data.fallbackMessage || "I'm sorry, I don't have an answer for that yet. Would you like to speak with a human?",
      leadCaptureEnabled: data.leadCaptureEnabled ?? true,
      businessGoal: data.businessGoal || "",
      model: "openrouter-default",
      monthlyMessageLimit: 500,
      monthlyMessagesUsed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    await setDoc(doc(db, "agents", agentId), {
      ...agentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return agentData;
  },

  async getAgentById(agentId: string) {
    const docRef = doc(db, "agents", agentId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as Agent;
    }
    return null;
  },

  async getAgentsByBusinessId(businessId: string) {
    const q = query(collection(db, "agents"), where("businessId", "==", businessId), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Agent);
  },

  async updateAgent(agentId: string, data: Partial<Agent>) {
    const docRef = doc(db, "agents", agentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async archiveAgent(agentId: string) {
    await this.updateAgent(agentId, { status: "draft" });
  },

  async getAgentsForAdmin() {
    const q = query(collection(db, "agents"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as Agent);
  }
};

// --- Knowledge Base Service ---
export const knowledgeBaseService = {
  async createKnowledgeItem(businessId: string, data: Partial<KnowledgeItem>) {
    const itemId = doc(collection(db, "knowledgeBase")).id;
    const itemData: KnowledgeItem = {
      id: itemId,
      businessId,
      agentId: data.agentId || "all",
      type: data.type || "faq",
      title: data.title || "",
      content: data.content || "",
      status: data.status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    await setDoc(doc(db, "knowledgeBase", itemId), {
      ...itemData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return itemData;
  },

  async getKnowledgeItemsByBusiness(businessId: string) {
    const q = query(
      collection(db, "knowledgeBase"), 
      where("businessId", "==", businessId),
      where("status", "!=", "archived"),
      orderBy("status"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as KnowledgeItem);
  },

  async getKnowledgeItemsByAgent(businessId: string, agentId: string) {
    const q = query(
      collection(db, "knowledgeBase"),
      where("businessId", "==", businessId),
      where("agentId", "in", ["all", agentId]),
      where("status", "==", "active"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as KnowledgeItem);
  },

  async updateKnowledgeItem(itemId: string, data: Partial<KnowledgeItem>) {
    const docRef = doc(db, "knowledgeBase", itemId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async archiveKnowledgeItem(itemId: string) {
    await this.updateKnowledgeItem(itemId, { status: "archived" });
  },

  async deleteKnowledgeItem(itemId: string) {
    await deleteDoc(doc(db, "knowledgeBase", itemId));
  }
};

// --- Conversation Service ---
export const conversationService = {
  async createConversation(businessId: string, agentId: string, data: Partial<Conversation>) {
    const conversationId = doc(collection(db, "conversations")).id;
    const conversationData: Conversation = {
      id: conversationId,
      businessId,
      agentId,
      visitorId: data.visitorId || "anon-" + Math.random().toString(36).substring(7),
      status: "open",
      source: data.source || "hosted_page",
      startedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    await setDoc(doc(db, "conversations", conversationId), {
      ...conversationData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return conversationData;
  },

  async getConversationById(conversationId: string) {
    const docSnap = await getDoc(doc(db, "conversations", conversationId));
    return docSnap.exists() ? docSnap.data() as Conversation : null;
  },

  async getConversationsByBusiness(businessId: string) {
    const q = query(
      collection(db, "conversations"), 
      where("businessId", "==", businessId),
      orderBy("lastMessageAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Conversation);
  },

  async getConversationsForAdmin() {
    const q = query(collection(db, "conversations"), orderBy("createdAt", "desc"), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Conversation);
  },

  async updateConversationStatus(conversationId: string, status: Conversation["status"]) {
    await updateDoc(doc(db, "conversations", conversationId), {
      status,
      updatedAt: serverTimestamp()
    });
  },

  async updateLastMessageAt(conversationId: string) {
    await updateDoc(doc(db, "conversations", conversationId), {
      lastMessageAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
};

// --- Message Service ---
export const messageService = {
  async createMessage(conversationId: string, data: Partial<Message>) {
    const messageId = doc(collection(db, "conversations", conversationId, "messages")).id;
    const messageData: Message = {
      id: messageId,
      conversationId,
      businessId: data.businessId || "",
      agentId: data.agentId || "",
      role: data.role || "visitor",
      content: data.content || "",
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, "conversations", conversationId, "messages", messageId), {
      ...messageData,
      createdAt: serverTimestamp(),
    });

    // Update conversation last message time
    await conversationService.updateLastMessageAt(conversationId);

    return messageData;
  },

  async getMessagesByConversation(conversationId: string) {
    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Message);
  }
};

// --- Lead Service ---
export const leadService = {
  async createLead(businessId: string, agentId: string, data: Partial<Lead>) {
    const leadId = doc(collection(db, "leads")).id;
    const leadData: Lead = {
      id: leadId,
      businessId,
      agentId,
      conversationId: data.conversationId || "",
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      serviceRequested: data.serviceRequested || "",
      message: data.message || "",
      source: data.source || "hosted_page",
      status: "new",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    await setDoc(doc(db, "leads", leadId), {
      ...leadData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // If conversationId is present, link lead to conversation and update status
    if (data.conversationId) {
      await updateDoc(doc(db, "conversations", data.conversationId), {
        leadId: leadId,
        status: "lead_captured",
        updatedAt: serverTimestamp()
      });
    }

    return leadData;
  },

  async getLeadsByBusiness(businessId: string) {
    const q = query(
      collection(db, "leads"), 
      where("businessId", "==", businessId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Lead);
  },

  async getLeadsForAdmin() {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(100));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Lead);
  },

  async updateLeadStatus(leadId: string, status: Lead["status"]) {
    await updateDoc(doc(db, "leads", leadId), {
      status,
      updatedAt: serverTimestamp()
    });
  }
};

// --- Audit Log Service ---
export const auditLogService = {
  async createAuditLog(data: Omit<AuditLog, "id" | "createdAt">) {
    const logId = doc(collection(db, "auditLogs")).id;
    await setDoc(doc(db, "auditLogs", logId), {
      id: logId,
      ...data,
      createdAt: serverTimestamp(),
    });
  }
};
