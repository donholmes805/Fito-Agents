import { Agent, Lead } from "@/types";

// Real Firestore Services (Auth, Business, Agent, Knowledge, Leads, Conversations)
export * from "./auth";
export * from "./firestore";

/**
 * AI Service Placeholder
 * In Phase 2D, this will connect to OpenRouter API via server-side routes.
 */
export const aiService = {
  async sendAgentMessage(agentId: string, conversationId: string, content: string): Promise<string> {
    console.log(`Sending message to agent ${agentId} in conversation ${conversationId}: ${content}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `This is a mock response from Fito AI for agent ${agentId}. I'm processing your request: "${content}"`;
  },

  buildAgentPrompt(agent: Agent, businessContext: string): string {
    return `You are ${agent.name}, a ${agent.type} agent with a ${agent.tone} tone. 
    Your goal is: ${agent.businessGoal}. 
    Business Context: ${businessContext}`;
  },

  detectLeadIntent(content: string): boolean {
    const leadKeywords = ['quote', 'contact', 'price', 'pricing', 'interested', 'call', 'email', 'phone'];
    return leadKeywords.some(keyword => content.toLowerCase().includes(keyword));
  },

  async extractLeadFields(_text: string): Promise<Partial<Lead>> {
    return {};
  }
};

/**
 * Billing Service Placeholder (Stripe)
 * In Phase 3, this will integrate with Stripe.
 */
export const billingService = {
  async createCheckoutSession(planId: string, businessId: string, userId: string): Promise<string> {
    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId, businessId, userId }),
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  },

  async createCustomerPortalSession(businessId: string, userId: string): Promise<string> {
    const response = await fetch("/api/stripe/create-portal-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ businessId, userId }),
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  },

  async syncSubscriptionStatus(businessId: string): Promise<void> {
    console.log(`Syncing subscription for business ${businessId} via webhooks automatically`);
  }
};

/**
 * Usage Service Placeholder
 */
export const usageService = {
  async getUsageStats(_businessId: string): Promise<any> {
    return { messagesUsed: 8420, limit: 10000 };
  }
};
