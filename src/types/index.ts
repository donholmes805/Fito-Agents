export type UserRole = "owner" | "admin" | "business_owner" | "team_member";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  businessId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  website?: string;
  phone?: string;
  email: string;
  address?: string;
  businessHours?: string;
  serviceArea?: string;
  industry?: string;
  description?: string;
  plan: "starter" | "business" | "advanced" | "custom" | "free";
  subscriptionStatus: "trial" | "active" | "past_due" | "canceled" | "incomplete" | "unpaid" | "paused" | "owner_override";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  monthlyMessagesUsed?: number;
  setupFeeStatus?: "pending" | "paid" | "waived";
  ownerOverride?: boolean;
  customPlan?: string;
  lastUsageResetAt?: string;
  nextUsageResetAt?: string;
  usageWarning80SentAt?: string;
  usageWarning100SentAt?: string;
  lastUsageWarningLevel?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  businessId: string;
  name: string;
  type: "website" | "support" | "sales" | "booking" | "document" | "app";
  status: "active" | "inactive" | "draft";
  greeting: string;
  tone: string;
  brandColor: string;
  widgetPosition: "bottom-right" | "bottom-left";
  fallbackMessage: string;
  escalationEmail?: string;
  leadCaptureEnabled: boolean;
  businessGoal: string;
  model: string;
  monthlyMessageLimit: number;
  monthlyMessagesUsed: number;
  lastUsageResetAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItem {
  id: string;
  businessId: string;
  agentId: string; // "all" or specific agentId
  type: "faq" | "service" | "pricing" | "policy" | "link" | "document";
  title: string;
  content: string; // Primary text content
  status: "active" | "draft" | "needs_review" | "archived";
  source?: string;
  
  // Type specific fields
  question?: string;
  answer?: string;
  serviceName?: string;
  description?: string;
  startingPrice?: string;
  itemName?: string;
  price?: string;
  policyName?: string;
  policyText?: string;
  label?: string;
  url?: string;
  fileName?: string;
  textContent?: string;
  uploadStatus?: string;
  fileUrl?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  businessId: string;
  agentId: string;
  visitorId: string;
  leadId?: string;
  status: "open" | "lead_captured" | "escalated" | "closed" | "archived";
  source: "hosted_page" | "dashboard_preview" | "embed_widget" | "wordpress_plugin";
  startedAt: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  businessId: string;
  agentId: string;
  role: "visitor" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  businessId: string;
  agentId: string;
  conversationId?: string;
  name: string;
  email: string;
  phone?: string;
  serviceRequested?: string;
  message?: string;
  status: "new" | "contacted" | "won" | "lost" | "archived";
  source?: "hosted_page" | "dashboard_preview" | "embed_widget" | "wordpress_plugin";
  notificationEmailSent?: boolean;
  notificationEmailSentAt?: string;
  notificationEmailError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageLog {
  id: string;
  businessId: string;
  agentId: string;
  conversationId?: string;
  type: "message" | "lead" | "other";
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  messagesUsed: number;
  costEstimate?: number;
  source: string;
  createdAt: any;
}

export interface Subscription {
  id: string;
  businessId: string;
  ownerId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  stripeProductId?: string;
  plan: "starter" | "business" | "advanced" | "custom" | "free";
  status: "trial" | "active" | "past_due" | "canceled" | "incomplete" | "unpaid" | "paused" | "owner_override";
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  setupFeeStatus: "pending" | "paid";
  ownerOverride: boolean;
  customPlan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AdminSettings {
  openRouterApiKey?: string;
  defaultModel: string;
  fallbackModel: string;
  monthlyTokenLimit: number;
  globalSafetyPrompt: string;
  emailProvider: string;
  stripeWebhookSecret?: string;
}
