import { Agent, Business, KnowledgeItem, Message, UsageLog } from "@/types";
import { adminDb } from "@/lib/firebase/admin";
import { EmailService } from "./email.server";
import { getPlanConfig } from "@/config/plans";
import { FieldValue } from "firebase-admin/firestore";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const DEFAULT_MODEL = process.env.OPENROUTER_DEFAULT_MODEL || "anthropic/claude-3-haiku";
const SITE_NAME = process.env.OPENROUTER_SITE_NAME || "Fito Agents";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const aiServerService = {
  /**
   * Main entry point for generating an agent response
   */
  async generateAgentResponse(params: {
    businessId: string;
    agentId: string;
    conversationId?: string;
    message: string;
    source: string;
    history: Message[];
  }) {
    const { businessId, agentId, conversationId, message, source, history } = params;

    if (!adminDb) {
      throw new Error("Firebase Admin not configured");
    }

    // 1. Fetch Context
    const [business, agent, knowledgeItems] = await Promise.all([
      this.getBusiness(businessId),
      this.getAgent(agentId),
      this.getKnowledge(businessId, agentId)
    ]);

    if (!business || !agent) {
      throw new Error("Business or Agent not found");
    }

    // 2. Check Plan Limits
    if (agent.monthlyMessagesUsed >= agent.monthlyMessageLimit) {
      return {
        content: agent.fallbackMessage || "This AI agent has reached its monthly message limit. Please contact the business directly.",
        isLimitReached: true
      };
    }

    // 3. Build Prompt
    const systemPrompt = this.buildAgentSystemPrompt(business, agent, knowledgeItems);
    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map(m => ({ role: m.role === 'visitor' ? 'user' : 'assistant', content: m.content })),
      { role: "user", content: message }
    ];

    // 4. Call OpenRouter
    try {
      const response = await this.callOpenRouter(messages);
      
      // 5. Track Usage
      await this.logUsage({
        businessId,
        agentId,
        conversationId,
        model: response.model,
        tokens: response.usage,
        source
      });

      // 6. Update Usage Counts
      const batch = adminDb.batch();
      batch.update(adminDb.collection('agents').doc(agentId), {
        monthlyMessagesUsed: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      });
      batch.update(adminDb.collection('businesses').doc(businessId), {
        monthlyMessagesUsed: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp()
      });
      await batch.commit();

      // 7. Check Usage Thresholds & Send Warnings (Async, don't block response)
      if (source !== 'dashboard_preview') {
        this.checkAndSendUsageWarnings(businessId, agentId).catch(err => console.error("Usage warning trigger failed:", err));
      }

      return {
        content: response.content,
        model: response.model,
        usage: response.usage
      };
    } catch (error) {
      console.error("OpenRouter error:", error);
      return {
        content: agent.fallbackMessage || "I'm having trouble responding right now, but I can still help send your message to the business. Please leave your contact details.",
        isFallback: true
      };
    }
  },

  /**
   * Check thresholds and send emails if needed
   */
  async checkAndSendUsageWarnings(businessId: string, agentId: string) {
    if (!adminDb) return;

    // Fetch fresh data
    const [businessDoc, agentDoc] = await Promise.all([
      adminDb.collection('businesses').doc(businessId).get(),
      adminDb.collection('agents').doc(agentId).get()
    ]);

    if (!businessDoc.exists || !agentDoc.exists) return;
    const business = businessDoc.data() as Business;
    const agent = agentDoc.data() as Agent;
    
    if (business.ownerOverride) return; // Skip warnings for overrides

    const planConfig = getPlanConfig(business.plan || 'starter');
    const used = business.monthlyMessagesUsed || 0;
    const limit = planConfig.monthlyMessageLimit;
    const percent = (used / limit) * 100;
    
    let recipientEmail = business.email;
    if (!recipientEmail) {
        const ownerDoc = await adminDb.collection('users').doc(business.ownerId).get();
        recipientEmail = ownerDoc.data()?.email;
    }
    if (!recipientEmail) {
        recipientEmail = agent.escalationEmail || "";
    }

    if (!recipientEmail) return;

    const now = new Date().toISOString();
    const updates: any = {};

    // 100% Warning
    if (percent >= 100 && !business.usageWarning100SentAt) {
        await EmailService.sendUsageLimitReachedEmail({
            business,
            recipientEmail,
            limit,
            nextResetDate: business.nextUsageResetAt
        });
        updates.usageWarning100SentAt = now;
        updates.lastUsageWarningLevel = 100;
    } 
    // 80% Warning
    else if (percent >= 80 && percent < 100 && !business.usageWarning80SentAt) {
        await EmailService.sendUsageWarningEmail({
            business,
            recipientEmail,
            used,
            limit,
            nextResetDate: business.nextUsageResetAt
        });
        updates.usageWarning80SentAt = now;
        updates.lastUsageWarningLevel = 80;
    }

    if (Object.keys(updates).length > 0) {
        await adminDb.collection('businesses').doc(businessId).update(updates);
    }
  },

  async getBusiness(id: string): Promise<Business | null> {
    const doc = await adminDb.collection('businesses').doc(id).get();
    return doc.exists ? doc.data() as Business : null;
  },

  async getAgent(id: string): Promise<Agent | null> {
    const doc = await adminDb.collection('agents').doc(id).get();
    return doc.exists ? doc.data() as Agent : null;
  },

  async getKnowledge(businessId: string, agentId: string): Promise<KnowledgeItem[]> {
    const snapshot = await adminDb.collection('knowledgeBase')
      .where('businessId', '==', businessId)
      .where('status', '==', 'active')
      .where('agentId', 'in', ['all', agentId])
      .get();
    
    return snapshot.docs.map(doc => doc.data() as KnowledgeItem);
  },

  buildAgentSystemPrompt(business: Business, agent: Agent, knowledge: KnowledgeItem[]) {
    const businessContext = `
BUSINESS INFORMATION:
Name: ${business.name}
Website: ${business.website || 'N/A'}
Industry: ${business.industry || 'N/A'}
Description: ${business.description || 'N/A'}
Phone: ${business.phone || 'N/A'}
Email: ${business.email || 'N/A'}
Address: ${business.address || 'N/A'}
Hours: ${business.businessHours || 'N/A'}
Service Area: ${business.serviceArea || 'N/A'}
`;

    const agentContext = `
YOUR IDENTITY:
Name: ${agent.name}
Role: ${agent.type} assistant
Tone: ${agent.tone}
Goal: ${agent.businessGoal}
Greeting: ${agent.greeting}
`;

    const knowledgeContext = knowledge.length > 0 
      ? `
KNOWLEDGE BASE:
${knowledge.map(item => `
[${item.type.toUpperCase()}: ${item.title}]
${item.content}
${item.answer ? `Answer: ${item.answer}` : ''}
${item.price ? `Price: ${item.price}` : ''}
`).join('\n')}
` : '';

    return `
You are an AI assistant for ${business.name}. 
${agentContext}
${businessContext}
${knowledgeContext}

SAFETY & OPERATING GUIDELINES:
1. Use only the provided information to answer questions.
2. If the answer is not in the knowledge base or business profile, politely say you don't have that specific information and offer to take their contact details so a human can follow up.
3. Tone: Maintain a ${agent.tone} tone at all times.
4. Lead Capture: If the visitor expresses interest in services, pricing, or needs specific help, encourage them to provide their name and contact info.
5. NEVER invent prices, policies, or guarantees.
6. NEVER mention you are an AI model or powered by OpenRouter. You are the business's custom AI agent.
7. Keep responses concise and helpful.
8. Do not provide medical, legal, or financial advice.
`;
  },

  async callOpenRouter(messages: any[]) {
    if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'sk-or-v1-placeholder') {
      throw new Error("OpenRouter API Key not configured");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: messages,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: data.usage
    };
  },

  async logUsage(params: {
    businessId: string;
    agentId: string;
    conversationId?: string;
    model: string;
    tokens: any;
    source: string;
  }) {
    const { businessId, agentId, conversationId, model, tokens, source } = params;
    
    if (!adminDb) return;
    
    const usageLog: Omit<UsageLog, 'id'> = {
      businessId,
      agentId,
      conversationId,
      type: 'message',
      model,
      inputTokens: tokens?.prompt_tokens || 0,
      outputTokens: tokens?.completion_tokens || 0,
      totalTokens: tokens?.total_tokens || 0,
      messagesUsed: 1,
      source,
      createdAt: FieldValue.serverTimestamp()
    };

    await adminDb.collection('usageLogs').add(usageLog);
  },

  detectLeadIntent(message: string): boolean {
    const keywords = ['quote', 'price', 'pricing', 'cost', 'appointment', 'book', 'schedule', 'callback', 'contact', 'interested', 'hire', 'buy', 'purchase'];
    const msg = message.toLowerCase();
    return keywords.some(k => msg.includes(k));
  }
};
